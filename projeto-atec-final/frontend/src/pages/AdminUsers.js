import React, { useEffect, useState } from 'react';

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [erro, setErro] = useState("");
    
    // Estado do Formulário
    const [formData, setFormData] = useState({ nome: '', email: '', password: '', is_admin: false });
    // Estado para saber se estamos a editar alguém (guarda o ID)
    const [editandoId, setEditandoId] = useState(null);

    // 1. CARREGAR (READ)
    const fetchUsers = async () => {
        try {
            const response = await fetch("http://localhost:5000/admin/todos", {
                method: "GET",
                headers: { token: localStorage.getItem("token") }
            });
            const data = await response.json();
            if (response.ok) setUsers(data);
            else setErro(data);
        } catch (err) { setErro("Erro ao ligar ao servidor"); }
    };

    useEffect(() => { fetchUsers(); }, []);

    // 2. APAGAR (DELETE)
    const handleDelete = async (id) => {
        if(!window.confirm("Tens a certeza?")) return;
        const response = await fetch(`http://localhost:5000/admin/apagar/${id}`, {
            method: "DELETE",
            headers: { token: localStorage.getItem("token") }
        });
        if (response.ok) fetchUsers();
    };

    // 3. PREPARAR EDIÇÃO (Ao clicar no botão amarelo)
    const handleEditClick = (user) => {
        setEditandoId(user.id); // Guardamos o ID de quem estamos a editar
        setFormData({ 
            nome: user.nome, 
            email: user.email, 
            password: '', // Password fica vazia (não a mostramos nem editamos aqui)
            is_admin: user.is_admin 
        });
    };

    // 4. CANCELAR EDIÇÃO
    const handleCancel = () => {
        setEditandoId(null);
        setFormData({ nome: '', email: '', password: '', is_admin: false });
    };

    // 5. SUBMETER (CRIAR ou ATUALIZAR)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Se editandoId for null -> CRIAMOS NOVO. Se tiver ID -> ATUALIZAMOS.
        const url = editandoId 
            ? `http://localhost:5000/admin/editar/${editandoId}`
            : "http://localhost:5000/admin/criar";
        
        const method = editandoId ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 
                    "Content-Type": "application/json",
                    token: localStorage.getItem("token") 
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if(response.ok) {
                alert(editandoId ? "✅ Atualizado com sucesso!" : "✅ Criado com sucesso!");
                handleCancel(); // Limpa o formulário e sai do modo edição
                fetchUsers();   // Atualiza a lista
            } else {
                alert("❌ " + data);
            }
        } catch (error) { console.error(error); }
    }

    return (
        <div style={{ padding: "40px", fontFamily: "Arial" }}>
            <h1>Painel de Administração 👮‍♂️</h1>
            {erro && <p style={{color:'red'}}>{erro}</p>}

            {/* FORMULÁRIO INTELIGENTE (Cria e Edita) */}
            <div style={{ background: editandoId ? '#fff3cd' : '#f4f4f4', padding: '20px', marginBottom: '30px', borderRadius: '8px', border: editandoId ? '2px solid #ffc107' : 'none' }}>
                <h3>{editandoId ? `📝 A Editar Utilizador #${editandoId}` : '➕ Criar Novo Utilizador'}</h3>
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input 
                        placeholder="Nome" value={formData.nome} required 
                        onChange={e => setFormData({...formData, nome: e.target.value})} 
                        style={{padding: '8px'}}
                    />
                    <input 
                        placeholder="Email" value={formData.email} required 
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                        style={{padding: '8px'}}
                    />
                    {/* Só pedimos password se for NOVO utilizador (para simplificar) */}
                    {!editandoId && (
                        <input 
                            placeholder="Password" type="password" value={formData.password} required 
                            onChange={e => setFormData({...formData, password: e.target.value})} 
                            style={{padding: '8px'}}
                        />
                    )}
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        Admin? 
                        <input 
                            type="checkbox" checked={formData.is_admin} 
                            onChange={e => setFormData({...formData, is_admin: e.target.checked})} 
                        />
                    </label>

                    <button type="submit" style={{ background: editandoId ? '#ffc107' : 'green', color: 'black', border: 'none', padding: '8px 15px', cursor: 'pointer', fontWeight: 'bold' }}>
                        {editandoId ? 'Guardar Alterações' : 'Criar'}
                    </button>

                    {editandoId && (
                        <button type="button" onClick={handleCancel} style={{ background: '#ccc', border: 'none', padding: '8px 15px', cursor: 'pointer' }}>
                            Cancelar
                        </button>
                    )}
                </form>
            </div>

            {/* TABELA */}
            <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ backgroundColor: "#ddd" }}>
                        <th>ID</th><th>Nome</th><th>Email</th><th>Role</th><th>Admin?</th><th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} style={{ textAlign: "center", background: user.is_admin ? '#e6fffa' : 'white' }}>
                            <td>{user.id}</td>
                            <td>{user.nome}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>{user.is_admin ? "✅ SIM" : "NÃO"}</td>
                            <td>
                                <button onClick={() => handleEditClick(user)} style={{ marginRight: "10px", cursor: "pointer", background: "#ffc107", border: "none", padding: "5px 10px" }}>
                                    ✏️ Editar
                                </button>
                                <button onClick={() => handleDelete(user.id)} style={{ backgroundColor: "red", color: "white", border:"none", cursor: "pointer", padding: "5px 10px" }}>
                                    🗑️ Apagar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminUsers;