import './App.css'
import {Editor} from "@monaco-editor/react"
import { MonacoBinding } from 'y-monaco'
import { useRef, useMemo, useState, useEffect } from 'react'
import * as Y from 'yjs'
import { SocketIOProvider } from 'y-socket.io'

function App() {
  const editorRef = useRef(null);
  const [username, setUsername] = useState(()=>{
    return new URLSearchParams(window.location.search).get("username") || ""
  })
  const [users,setUsers] = useState([])

  const ydoc = useMemo(()=> new Y.Doc(),[])
  const yText = useMemo(()=> ydoc.getText("monaco"),[ydoc])


  const handleJoin = (e)=>{
    e.preventDefault();
    setUsername(e.target.username.value);
    window.history.pushState({},"","?username="+e.target.username.value)
  }
  

  const handleMount = (editor)=>{
    editorRef.current = editor
    const monacoBinding = new MonacoBinding(
        yText,
        editorRef.current.getModel(),
        new Set([editorRef.current]),
    );

  }

  useEffect(()=>{
    if(username){
      const provider = new SocketIOProvider('http://localhost:3000', 'monaco', ydoc,{
        autoConnect: true,
      });

      provider.awareness.setLocalStateField("user",{username})

      const states = Array.from(provider.awareness.getStates().values())
      setUsers(states.filter(state => state.user && state.user.username).map(state => state.user))

      provider.awareness.on("change", ()=>{
        const states = Array.from(provider.awareness.getStates().values())

        setUsers(states.filter(state => state.user && state.user.username).map(state => state.user))
      })

      function handleBeforeUnload(){
        provider.awareness.setLocalStateField("user", null)
      }
      window.addEventListener("beforeunload",handleBeforeUnload)

      
      return()=>{
        provider.disconnect();
        window.removeEventListener("beforeunload",handleBeforeUnload)
      }
    }
  },[ username])

  if(!username){
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <input type="text" name="username" placeholder="Enter your name" className="p-2 rounded-lg"/>

          <button className="bg-blue-500 text-white p-2 rounded-lg">Join</button>
        </form>
      </div>
    )
  }

  return (
    <main className="h-screen w-full bg-gray-950 flex gap-4 p-4">
      <aside className="h-full w-1/5 bg-amber-50 rounded-lg">
        <h2 className="text-lg font-bold p-4 border-b border-gray-300">Users</h2>
        <ul className="p-4">
          {users.map((user,index)=>(
            <li key={index} className="p-2 border-b border-gray-300">{user.username}</li>
          ))}
        </ul>
      </aside>
      <section className="flex-1 h-full bg-neutral-800 rounded-lg overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// Start coding here..."
          theme="vs-dark"
          onMount={handleMount}
        />
      </section>
    </main>
  )
}

export default App
