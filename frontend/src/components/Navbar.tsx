// import logo from "../assets/icons/alertra.png"
const Navbar: React.FC = () => {
    return (
      <nav className="bg-gray-900 text-white flex items-center px-6 py-3  border-b border-gray-400">
        {/* Left Section: Logo */}
        <div className="text-lg font-semibold">
          {/* <img src={logo} className="h-35 w-20" alt="" /> */}
          <h1 className="text-3xl font-semibold">Alertra</h1>
        </div>
  
        {/* Center Section: Links */}
        <div className="flex space-x-8 ml-auto">
          <a href="#" className="hover:text-gray-400">Insights</a>
          <a href="#" className="hover:text-gray-400">Alerts</a>
          <a href="#" className="hover:text-gray-400">Reports</a>
          <a href="#" className="hover:text-gray-400">API</a>
        </div>
  
        {/* Right Section: Profile */}
        <div className="ml-6">
            <div className="flex items-center justify-center w-9 h-9 rounded-full border font-semibold">RM</div>
          {/* <img
            src="https://via.placeholder.com/36" // Replace with the actual profile image URL
            alt="Profile"
            className="w-9 h-9 rounded-full object-cover"
          /> */}
        </div>
      </nav>
    );
  };
  
  export default Navbar;
  