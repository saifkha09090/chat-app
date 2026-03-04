"use client"

import { BiUserCircle } from "react-icons/bi"
import LogoutBtn from "../buttons/LogoutBtn"
import { IoSend } from "react-icons/io5"
import { useState } from "react"

const Messages = () => {
  const [messages, setMessages] = useState();
  const [input, setInput] = useState("")
  return (
    <div className="w-2/3 pl-3">
          <header className="flex justify-between items-center py-2">
            <div
                          className="flex p-1 items-center gap-4 cursor-pointer hover:bg-gray-100 rounded-sm"
                        >
                          <div className="bg-blue-100 rounded-full">
                            <BiUserCircle className="w-7 h-7 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-gray-800 font-medium wrap-break-word">
                              user
                            </p>
                          </div>
                        </div>
            <LogoutBtn />
          </header>
          <main className="py-2 h-[82%]">
            <div className="">

            </div>
          </main>
          <footer>
           <div className="flex items-center mb-2 px-2.5">
                     <input
                       type="text"
                       name="searchBox"
                       value={input}
                       onChange={(e) => setInput(e.target.value)}
                       className="w-full border-r-0 rounded-lg rounded-br-none rounded-tr-none border-2 border-[#dcd8d8] outline-none p-2.5"
                       placeholder="Search"
                     />
                     <div className={`border-2 border-[#dcd8d8] border-l-0 rounded-lg rounded-bl-none rounded-tl-none  ${input !== "" ? "p-3.5" : "p-5.5"}`}>
                       {input !== "" &&  <IoSend />}
                     </div>
                   </div>
          </footer>
        </div>
  )
}

export default Messages