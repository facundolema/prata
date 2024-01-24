'use client'
import { stringifyError } from 'next/dist/shared/lib/utils';
import useSWR from 'swr';
import { useState } from 'react';

const user = 'rodlema';

const fetcher = (...args) => fetch(...args).then(res => {
  console.log(res)
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  return res.json();
});

export default function MessageDashboard() {
  const [message, setMessage] = useState('');
  const { data, error } = useSWR(`http://192.168.0.242:8080/${user}`, fetcher);


  const handleSubmit = (event) => {
    event.preventDefault();
    fetch('http://192.168.0.242:8080/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: message, sender: user, receiver: 'catalettieri' })
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    setMessage('');
  };

  if (error) return <div>failed to load {stringifyError(error)}</div>;
  if (!data) return <div>loading...</div>;
  return (
    <div className='flex flex-col w-full bg-gray-200 rounded-lg p-4 h-1/2 max-w-[800px]'>
      <div className='flex flex-col flex-1'>
      {
        data.map((message) => {
          const classss = message.sender === user ? 'bg-[#d7d2e5] rounded-t-lg rounded-bl-lg self-end' : 'bg-[#b8bfd5] rounded-t-lg rounded-br-lg items-end'
          return (
            <div className={`flex ${classss} px-4 py-2 text-black w-1/2 my-2 items-center gap-2 h-fit`}>
          <h1 className='text-sm font-semibold'>{message.sender}</h1>
          <p>{message.content}</p>
          </div>
        )}
        )
      }
      </div>
      <form className='flex w-full h-fit gap-2 justify-self-end' onSubmit={handleSubmit}>
        <input className='flex-grow rounded-lg p-2 border border-gray-500 text-black' type='text' placeholder='Type a message...' value={message} onChange={(event) => setMessage(event.target.value)} />
        <button className='bg-blue-500 rounded-lg p-2 text-white'>Send</button>
      </form>
    </div>
  )
}
