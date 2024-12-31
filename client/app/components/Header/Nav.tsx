
import React, { useState } from "react";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Nav() {
  const [activeItem, setActiveItem] = useState("home");
  const { isSignedIn, user } = useUser();

  const navigationItems = [
    {
      name: "Home",
      href: "/",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      name: "Explorer",
      href: "/explorer",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
    },
    {
      name: "Learning Path",
      href: "/dashboard",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
    },
    {
      name: "Credentials",
      href: "/credentials",
      badge: "New",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      ),
    },
    {
      name: "Community",
      href: "/feed",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-slate-900 text-white fixed h-screen">
        <div className="p-4">
          <h1 className="text-2xl font-bold">
            <span className="text-3xl text-teal-400">L</span>earnopolyhh
          </h1>
        </div>

        <nav className="flex-1 p-4">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 p-3 rounded-lg mb-2 transition-colors duration-200 ${
                activeItem === item.name.toLowerCase()
                  ? "bg-teal-400/10 text-teal-400"
                  : "hover:bg-slate-800"
              }`}
              onClick={() => setActiveItem(item.name.toLowerCase())}
            >
              <span className="text-slate-300">{item.icon}</span>
              <span>{item.name}</span>
              {item.badge && (
                <Badge
                  variant="secondary"
                  className="ml-auto bg-teal-400/20 text-teal-400"
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          {isSignedIn ? (
            <div className="flex items-center space-x-3">
              <UserButton afterSignOutUrl="/" />
              <div className="text-sm">
                <p className="font-medium">{user?.fullName}</p>
                <p className="text-slate-400">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Link href="/auth/sign-in">
                <Button className="w-full bg-teal-400 hover:bg-teal-500">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button variant="outline" className="w-full">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-50"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-slate-900 text-white p-0">
          <div className="flex flex-col h-full">
            <div className="p-4">
              <h1 className="text-2xl font-bold">
                <span className="text-3xl text-teal-400">L</span>earnopoly
              </h1>
            </div>

            <nav className="flex-1 p-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 p-3 rounded-lg mb-2 transition-colors duration-200 ${
                    activeItem === item.name.toLowerCase()
                      ? "bg-teal-400/10 text-teal-400"
                      : "hover:bg-slate-800"
                  }`}
                  onClick={() => setActiveItem(item.name.toLowerCase())}
                >
                  <span className="text-slate-300">{item.icon}</span>
                  <span>{item.name}</span>
                  {item.badge && (
                    <Badge
                      variant="secondary"
                      className="ml-auto bg-teal-400/20 text-teal-400"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
              {isSignedIn ? (
                <div className="flex items-center space-x-3">
                  <UserButton afterSignOutUrl="/" />
                  <div className="text-sm">
                    <p className="font-medium">{user?.fullName}</p>
                    <p className="text-slate-400">
                      {user?.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link href="/auth/sign-in">
                    <Button className="w-full bg-teal-400 hover:bg-teal-500">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/sign-up">
                    <Button variant="outline" className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64">{/* Your page content goes here */}</div>
    </div>
  );
}

// import React, { useState } from "react";
// import Link from "next/link";
// import { UserButton, useUser } from "@clerk/nextjs";
// import { Card, CardContent } from "@/components/ui/card";
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";

// export default function Nav() {
//   const [activeItem, setActiveItem] = useState("home");
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for controlling dropdown visibility
//   const { isSignedIn, user } = useUser();

//   const navigationItems = [
//     {
//       name: "Home",
//       href: "/",
//       icon: (
//         <svg
//           className="w-6 h-6"
//           fill="none"
//           viewBox="0 0 24 24"
//           stroke="currentColor"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
//           />
//         </svg>
//       ),
//       dropdown: [
//         {
//           name: "What We Do",
//           href: "/what-we-do",
//         },
//         {
//           name: "Who We Are",
//           href: "/who-we-are",
//         },
//       ],
//     },
//     {
//       name: "Explorer",
//       href: "/explorer",
//       icon: (
//         <svg
//           className="w-6 h-6"
//           fill="none"
//           viewBox="0 0 24 24"
//           stroke="currentColor"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//           />
//         </svg>
//       ),
//     },
//     {
//       name: "Learning Path",
//       href: "/dashboard",
//       icon: (
//         <svg
//           className="w-6 h-6"
//           fill="none"
//           viewBox="0 0 24 24"
//           stroke="currentColor"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
//           />
//         </svg>
//       ),
//     },
//     {
//       name: "Credentials",
//       href: "/credentials",
//       badge: "New",
//       icon: (
//         <svg
//           className="w-6 h-6"
//           fill="none"
//           viewBox="0 0 24 24"
//           stroke="currentColor"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.0 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
//           />
//         </svg>
//       ),
//     },
//     {
//       name: "Community",
//       href: "/feed",
//       icon: (
//         <svg
//           className="w-6 h-6"
//           fill="none"
//           viewBox="0 0 24 24"
//           stroke="currentColor"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
//           />
//         </svg>
//       ),
//     },
//   ];

//   const handleDropdownToggle = () => {
//     setIsDropdownOpen(!isDropdownOpen); // Toggle the dropdown state
//   };

//   return (
//     <div className="flex min-h-screen">
//       {/* Desktop Sidebar */}
//       <div className="hidden md:flex flex-col w-64 bg-slate-900 text-white fixed h-screen">
//         <div className="p-4">
//           <h1 className="text-2xl font-bold">
//             <span className="text-3xl text-teal-400">L</span>earnopoly
//           </h1>
//         </div>

//         <nav className="flex-1 p-4">
//           {navigationItems.map((item) => (
//             <div key={item.name}>
//               <Link
//                 href={item.href}
//                 className={`flex items-center space-x-3 p-3 rounded-lg mb-2 transition-colors duration-200 ${
//                   activeItem === item.name.toLowerCase()
//                     ? "bg-teal-400/10 text-teal-400"
//                     : "hover:bg-slate-800"
//                 }`}
//                 onClick={() => setActiveItem(item.name.toLowerCase())}
//               >
//                 <span className="text-slate-300">{item.icon}</span>
//                 <span>{item.name}</span>
//               </Link>

//               {/* Dropdown for "Home" link */}
//               {item.name === "Home" && (
//                 <div>
//                   <Button
//                     className="w-full text-slate-300 hover:bg-slate-800"
//                     onClick={handleDropdownToggle}
//                   >
//                     Toggle Dropdown
//                   </Button>

//                   {isDropdownOpen && (
//                     <div className="ml-8 mt-2 space-y-1">
//                       {item.dropdown && item.dropdown.map((dropdownItem) => (
//                         <Link
//                           key={dropdownItem.name}
//                           href={dropdownItem.href}
//                           className="flex items-center space-x-3 p-3 rounded-lg mb-2 text-slate-300 hover:bg-slate-800"
//                         >
//                           <span>{dropdownItem.name}</span>
//                         </Link>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           ))}
//         </nav>
//         <main className="flex-1 lg:ml-64"></main>
//         <div className="p-4 border-t border-slate-800">
//           {isSignedIn ? (
//             <div className="flex items-center space-x-3">
//               <UserButton afterSignOutUrl="/" />
//               <div className="text-sm">
//                 <p className="font-medium">{user?.fullName}</p>
//                 <p className="text-slate-400">
//                   {user?.primaryEmailAddress?.emailAddress}
//                 </p>
//               </div>
//             </div>
//           ) : (
//             <div className="space-y-2">
//               <Link href="/auth/sign-in">
//                 <Button className="w-full bg-teal-400 hover:bg-teal-500">
//                   Sign In
//                 </Button>
//               </Link>
//               <Link href="/auth/sign-up">
//                 <Button variant="outline" className="w-full">
//                   Sign Up
//                 </Button>
//               </Link>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Mobile Sidebar */}
//       <div className="md:hidden w-full">
//         <Sheet>
//           <SheetTrigger>
//             <Button variant="link">
//               <svg
//                 className="w-6 h-6 text-white"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M4 6h16M4 12h16M4 18h16"
//                 />
//               </svg>
//             </Button>
//           </SheetTrigger>
//           <SheetContent className="w-64 p-6">
//             <nav>
//               {navigationItems.map((item) => (
//                 <div key={item.name}>
//                   <Link
//                     href={item.href}
//                     className={`flex items-center space-x-3 p-3 rounded-lg mb-2 transition-colors duration-200 ${
//                       activeItem === item.name.toLowerCase()
//                         ? "bg-teal-400/10 text-teal-400"
//                         : "hover:bg-slate-800"
//                     }`}
//                     onClick={() => setActiveItem(item.name.toLowerCase())}
//                   >
//                     <span>{item.icon}</span>
//                     <span>{item.name}</span>
//                   </Link>

//                   {/* Dropdown for "Home" link */}
//                   {item.name === "Home" && isDropdownOpen && (
//                     <div className="ml-8 mt-2 space-y-1">
//                       {item.dropdown.map((dropdownItem) => (
//                         <Link
//                           key={dropdownItem.name}
//                           href={dropdownItem.href}
//                           className="flex items-center space-x-3 p-3 rounded-lg mb-2 text-slate-300 hover:bg-slate-800"
//                         >
//                           <span>{dropdownItem.name}</span>
//                         </Link>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </nav>
//           </SheetContent>
//         </Sheet>
//       </div>
//     </div>
//   );
// }
