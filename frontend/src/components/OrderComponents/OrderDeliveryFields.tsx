import { useState, useEffect } from "react";
import axios from "axios";

const NOVA_POSHTA_API_KEY = import.meta.env.VITE_REACT_APP_NOVA_POSHTA_API_KEY || "";

type CityOption = {
  Description: string;
  Ref: string;
};

type WarehouseOption = {
  Description: string;
  Number: string;
  Ref: string;
  TypeOfWarehouse: string;
};

type Props = {
  isPostomat: boolean;
  setIsPostomat: (v: boolean) => void;
  city: string;
  setCity: (v: string) => void;
  cityRef: string;
  setCityRef: (v: string) => void;
  warehouse: string;
  setWarehouse: (v: string) => void;
};

const OrderDeliveryFields = ({
  isPostomat,
  setIsPostomat,
  city,
  setCity,
  cityRef,
  setCityRef,
  warehouse,
  setWarehouse,
}: Props) => {
  const [cityOptions, setCityOptions] = useState<CityOption[]>([]);
  const [warehouseOptions, setWarehouseOptions] = useState<WarehouseOption[]>([]);
  const [warehouseLoading, setWarehouseLoading] = useState(false);
  const [showWarehouses, setShowWarehouses] = useState(false);

  useEffect(() => {
    if (city.length < 2) {
      setCityOptions([]);
      return;
    }
    const fetchCities = async () => {
      try {
        const res = await axios.post(
          "https://api.novaposhta.ua/v2.0/json/",
          {
            apiKey: NOVA_POSHTA_API_KEY,
            modelName: "Address",
            calledMethod: "getCities",
            methodProperties: {
              FindByString: city,
              Limit: "10",
              Page: "1",
            },
          }
        );
        const data = res.data as { data?: CityOption[] };
        setCityOptions(data.data || []);
      } catch {
        setCityOptions([]);
      }
    };
    fetchCities();
  }, [city]);

  useEffect(() => {
    if (!cityRef) {
      setWarehouseOptions([]);
      return;
    }
    const fetchWarehouses = async () => {
      setWarehouseLoading(true);
      try {
        const res = await axios.post(
          "https://api.novaposhta.ua/v2.0/json/",
          {
            apiKey: NOVA_POSHTA_API_KEY,
            modelName: "AddressGeneral",
            calledMethod: "getWarehouses",
            methodProperties: {
              CityRef: cityRef,
            },
          }
        );
        const data = res.data as { data?: WarehouseOption[] };
        setWarehouseOptions(data.data || []);
      } catch {
        setWarehouseOptions([]);
      }
      setWarehouseLoading(false);
    };
    fetchWarehouses();
  }, [cityRef, isPostomat]);

  const handleCitySelect = (option: CityOption) => {
    setCity(option.Description);
    setCityRef(option.Ref);
    setWarehouse("");
  };

  const handleTypeChange = (type: "branch" | "postomat") => {
    setIsPostomat(type === "postomat");
    setWarehouse("");
  };

  return (
    <>
      <div className="flex items-center mb-3 gap-4">
        <label
          className={`flex items-center gap-2 cursor-pointer px-2 py-1 rounded transition-colors ${
            !isPostomat ? "bg-accent text-white" : "bg-gray-200 text-dark"
          } hover:bg-accent/80`}
        >
          <input
            type="checkbox"
            checked={!isPostomat}
            onChange={() => handleTypeChange("branch")}
            className="accent-accent"
          />
          Відділення
        </label>
        <label
          className={`flex items-center gap-2 cursor-pointer px-2 py-1 rounded transition-colors ${
            isPostomat ? "bg-accent text-white" : "bg-gray-200 text-dark"
          } hover:bg-accent/80`}
        >
          <input
            type="checkbox"
            checked={isPostomat}
            onChange={() => handleTypeChange("postomat")}
            className="accent-accent"
          />
          Поштомат
        </label>
      </div>
      <div className="mb-3 relative">
        <input
          className="input-main w-full"
          placeholder="Місто"
          value={city}
          onChange={e => {
            setCity(e.target.value);
            setCityRef("");
            setWarehouse("");
          }}
          required
        />
        {city.length > 1 && cityOptions.length > 0 && !cityRef && (
          <ul className="absolute z-10 bg-white border rounded w-full max-h-40 overflow-auto shadow">
            {cityOptions.map(option => (
              <li
                key={option.Ref}
                className="px-3 py-2 text-black transition-colors duration-150 cursor-pointer hover:bg-orange-500 hover:text-white"
                onClick={() => handleCitySelect(option)}
              >
                {option.Description}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mb-6 flex flex-col items-stretch">
        <label className="mb-1 text-dark font-semibold">
          {isPostomat ? "Оберіть поштомат" : "Оберіть відділення"}
        </label>
        <div className="relative">
          <button
            type="button"
            className="select-main w-full text-left py-2 px-3 rounded border bg-white"
            onClick={() => setShowWarehouses(prev => !prev)}
            style={{ minHeight: "2.5rem" }}
          >
            {warehouse
              ? warehouse
              : isPostomat
                ? "Оберіть поштомат"
                : "Оберіть відділення"}
          </button>
          {showWarehouses && (
            <div
              className="absolute left-0 right-0 mt-1 bg-white border rounded shadow-lg z-20 max-h-50 overflow-auto"
              style={{ minWidth: "100%", maxWidth: "100%" }}
            >
              {warehouseOptions
                .filter(w =>
                  isPostomat
                    ? w.TypeOfWarehouse === "f9316480-5f2d-425d-bc2c-ac7cd29decf0"
                    : w.TypeOfWarehouse !== "f9316480-5f2d-425d-bc2c-ac7cd29decf0"
                )
                .map(w => (
                  <div
                    key={w.Ref}
                    className={`px-3 py-2 cursor-pointer text-black hover:bg-orange-500 hover:text-white transition-colors text-sm break-words`}
                    onClick={() => {
                      setWarehouse(w.Description);
                      setShowWarehouses(false);
                    }}
                  >
                    <span className="font-semibold">{w.Number}.</span> {w.Description}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderDeliveryFields;
