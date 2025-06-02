type Props = {
  purpose?: string;
};

const CompanyBankDetails = ({ purpose }: Props) => (
  <div className="bg-white rounded-xl shadow p-6 max-w-lg mx-auto text-dark">
    <h3 className="text-xl font-bold mb-4 text-accent">Реквізити підприємства</h3>
    <div className="mb-2"><b>Найменування:</b> ТОВ "Онлайн Стор"</div>
    <div className="mb-2"><b>Код ЄДРПОУ:</b> 12345678</div>
    <div className="mb-2"><b>Юридична адреса:</b> 01001, м. Київ, вул. Прикладна, буд. 10, оф. 25</div>
    <div className="mb-2"><b>Поштова адреса:</b> 02090, м. Київ, а/с 123</div>
    <div className="mb-2"><b>IBAN:</b> UA123456789012345678901234567</div>
    <div className="mb-2"><b>Банк:</b> АТ "Універсал Банк"</div>
    <div className="mb-2"><b>МФО:</b> 322001</div>
    <div className="mb-2"><b>Телефон:</b> <a href="tel:+380441234567" className="text-accent underline">+38 (044) 123-45-67</a></div>
    <div className="mb-2"><b>Email:</b> <a href="mailto:info@onlinestore.ua" className="text-accent underline">info@onlinestore.ua</a></div>
    {purpose && (
      <div className="mt-4 p-3 rounded bg-[#f3f0ff] text-dark border border-accent">
        <b>Призначення платежу:</b> {purpose}
      </div>
    )}
  </div>
);

export default CompanyBankDetails;
