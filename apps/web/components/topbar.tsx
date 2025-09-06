"use client";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { FiMenu } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import { GiNetworkBars } from "react-icons/gi";

export const Topbar = ({ showDuration = true }: { showDuration?: boolean }) => {
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const getClientSideCookie = (name: string) => {
      const cookieValue = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${name}=`))
        ?.split("=");

      return cookieValue ? cookieValue[1] : undefined;
    };

    const cookie = getClientSideCookie("userToken");
    setCookie(cookie as string);
  }, []);
  const [cookie, setCookie] = useState("");

  const navItems = [
    { label: "Home", href: "/" },
    // { label: "About", href: "/About" },
    // { label: "Services", href: "/Services" },
    // // { label: "Pages", href: "/Pages" },
    // { label: "Contact", href: "/Contact" },
    // { label: "Stories", href: "/Stories" },
  ];
  return (
    <div>
      <motion.div
        initial={{ y: "-400px" }}
        animate={{ y: "0px" }}
        className={` ${showDuration && "duration-100"} border bg-black text-white`}
      >
        <div className="flex items-center justify-center ">
          <div className="rounded-lg border-gray-800 border  w-full shadow-lg flex justify-between  p-3 items-center">
            <Link href={"/"}>
              {/* <Image
                height={50}
                width={50}
                alt="logo"
                src={"/logo.jpeg"}
                className="rounded-full"
              ></Image> */}
              <GiNetworkBars></GiNetworkBars>
            </Link>
            <div className="md:flex gap-10 hidden ">
              {navItems.map((item, idx) => (
                <Link
                  href={item.href}
                  key={idx}
                  className="hover:underline cursor-pointer"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="md:flex gap-4 hidden ">
              {" "}
              <Link href={cookie ? "/dashboard" : "/"}>
                <button className=" px-6 py-1 rounded-md hover:scale-105 cursor-pointer hover:bg-indigo-400 hover:text-white border hover:border-black">
                  {" "}
                  {cookie ? "Dashboard" : "Login"}
                </button>
              </Link>
            </div>
            <div className="md:hidden" onClick={() => setShowMenu((c) => !c)}>
              {showMenu ? <RxCross1 size={25} /> : <FiMenu size={25} />}
            </div>
          </div>
        </div>
        <div className="absolute w-full md:hidden">
          <div
            className={`flex duration-300 flex-col z-10 bg-black text-white border justify-center items-center shadow-xl relative ${
              showMenu ? "top-0" : "top-[-400px]"
            }  m-4 rounded-3xl p-1`}
          >
            <div className={` w-full text-center p-2`}>
              {navItems.map((item, idx) => (
                <div
                  key={idx}
                  className="w-full text-center border-b cursor-pointer p-2"
                >
                  <Link href={item.href} className="hover:underline">
                    {item.label}
                  </Link>
                </div>
              ))}
            </div>

            <a href={cookie ? "/dashboard" : "/"}>
              <button className=" px-6 py-1 rounded-md hover:scale-105 cursor-pointer hover:bg-indigo-400 hover:text-white border hover:border-black">
                {" "}
                {cookie ? "Dashboard" : "Login"}
              </button>
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
