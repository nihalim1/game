import { useState } from "react";

export default function Register() {
  const [name, setName] = useState('');
  const [lname, setLname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://mgt2.pnu.ac.th/kong/app-game/teacher_signup.php', {
        method: 'POST',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, lname, email, password }),
      });

      const result = await response.json();
      if (result.success) {
        alert('ลงทะเบียนสำเร็จ');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('เกิดข้อผิดพลาด');
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>ลงทะเบียน</h2>
      <input 
        type="text" 
        placeholder="ชื่อ" 
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input 
        type="text" 
        placeholder="นามสกุล" 
        value={lname}
        onChange={(e) => setLname(e.target.value)}
        required
      />
      <input 
        type="email" 
        placeholder="Email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input 
        type="password" 
        placeholder="Password" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">ลงทะเบียน</button>
    </form>
  );
}
