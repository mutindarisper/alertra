import { useState } from "react";

export default function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md flex border rounded-lg shadow-lg overflow-hidden">
                {/* Left side - Styled */}
                <div className="w-1/2 bg-white p-6">
                    <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
                    <form>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" 
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" 
                            />
                        </div>
                        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">
                            Sign Up
                        </button>
                    </form>
                </div>
                
                {/* Right side - Empty */}
                <div className="w-1/2 bg-gray-200"></div>
            </div>
        </div>
    );
}


// import girl from "../assets/prog.jpg"
// export default function Portfolio() {

//   return (
//       <div className="bg-gray-100">
//           {/* Hero Section - Half Styled & Unfinished */}
//           <section className="flex h-screen items-center justify-center">
//               <div className="w-full max-w-4xl ">
//                   {/* Left side - Partially Styled */}
//                   <div className="w-1/2  p-10 flex flex-col justify-center">
//                       <h1 className="text-4xl font-bold mb-4 opacity-50">Hi, I'm Ri</h1>
//                       <p className="text-gray-600 mb-6 opacity-50">A passionate dev</p>
//                       {/* <button className="bg-blue-500 text-white py-2 px-4 rounded-md opacity-25 cursor-default">
//                           Cont
//                       </button> */}
//                   </div>
//                   {/* Right side - Empty */}
//                   <div className="w-1/2  flex items-center justify-center overflow-hidden">
//                         <img 
//                             src={girl}
//                             alt="Half of a lady programmer" 
//                             className="h-full object-cover" 
//                             style={{ clipPath: 'inset(0 0 0 50%)' }}
//                         />
//                     </div>
//               </div>
//           </section>
          
//           {/* About Section - Half Styled & Unfinished */}
//           <section className="px-8 flex">
//               <div className="w-1/2 text-center">
//                   <h2 className="text-3xl font-bold mb-4 opacity-50">Abou</h2>
//                   <p className="text-gray-600 max-w-2xl mx-auto opacity-50">I build innov</p>
//               </div>
//               <div className="w-1/2 "></div>
//           </section>

//           {/* Projects Section - Half Styled & Unfinished */}
//           <section className="py-16 px-8 flex">
//               <div className="w-1/2 text-center">
//                   <h2 className="text-3xl font-bold mb-4 opacity-50">Proj</h2>
//                   <ul className="text-gray-600 list-disc list-inside mx-auto w-2/3">
//                       <li className="opacity-50">Proj One</li>
//                       <li className="opacity-50">Proj Two</li>
//                       <li className="opacity-25">Proj Thr</li>
//                   </ul>
//               </div>
//               <div className="w-1/2 "></div>
//           </section>

//           {/* Skills Section - Half Styled & Unfinished */}
//           <section className="py-16 px-8 flex">
//               <div className="w-1/2 text-center">
//                   <h2 className="text-3xl font-bold mb-4 opacity-50">Skil</h2>
//                   <div className="flex justify-center gap-6">
//                       <div className="w-1/2 p-4 bg-white shadow-md rounded-md opacity-50">
//                           <p className="text-gray-700">Sve</p>
//                       </div>
//                       <div className="w-1/2 p-4 bg-white shadow-md rounded-md opacity-25">
//                           <p className="text-gray-700">Rea</p>
//                       </div>
//                   </div>
//               </div>
//               <div className="w-1/2 "></div>
//           </section>

//           {/* Contact Section - Half Styled & Unfinished */}
//           <section className="py-16 px-8 flex">
//               <div className="w-1/2 text-center">
//                   <h2 className="text-3xl font-bold mb-4 opacity-50">Cont</h2>
//                   <p className="text-gray-600 opacity-50">Reach out to co</p>
//                   <div className="opacity-25 bg-white shadow-md rounded-md p-4 mt-4">
//                       <p className="font-bold">Email: [emai</p>
//                   </div>
//               </div>
//               <div className="w-1/2 "></div>
//           </section>

//           {/* Footer - Half Styled & Unfinished */}
//           <footer className="py-6 flex">
//               <div className="w-1/2 bg-gray-800 text-white text-center opacity-50">
//                   <p>&copy; 2025 [Your Na</p>
//               </div>
//               <div className="w-1/2 "></div>
//           </footer>
//       </div>
//   );
// }
