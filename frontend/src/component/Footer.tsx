export default function Footer() {
  return (
    <div className=" text-center text-surface bg-neutral-600 text-white">
      <div className="px-6 pt-3">
        <form>
          <div className="mb-2 md:ms-auto flex flex-row justify-center space-x-2">
            <p>Contacts</p>
           
            <p> Email address:</p>
            <p className=" text-blue-300">
              velychko.oleksandr1@student.uzhnu.edu.u
            </p>
          </div>
        </form>
      </div>

      <div className="bg-neutral-700 p-2 text-center">
        © 2023 Copyright:
        <a className="pl-1" >Learning Materials</a>
      </div>
    </div>
  );
}
