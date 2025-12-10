const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = 3000;


app.use(cors());
app.use(express.json());
app.use(express.static('public'));


const pool = new Pool({
    
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:mickeymaluco0@localhost:5432/projeto',
    
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false});



app.get('/api/habits', async (req, res) => {
    try {
      
        await pool.query('UPDATE habits SET completed = false WHERE last_completed < CURRENT_DATE');
        
        
        const result = await pool.query('SELECT * FROM habits ORDER BY id DESC');
        
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao buscar:', err);
        res.status(500).json({ error: 'Erro ao buscar hábitos' });
    }
});



app.post('/api/habits', async (req, res) => {
    const { name, category, habit_time } = req.body;

    
    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'O nome é obrigatório' });
    }

    try {
        const result = await pool.query(
            
            'INSERT INTO habits (name, category, habit_time, streak) VALUES ($1, $2, $3, 0) RETURNING *',
            [name, category, habit_time]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao criar:', err);
        res.status(500).json({ error: 'Erro ao criar hábito' });
    }
});



app.put('/api/habits/:id', async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    
    try {
        if (completed) {
        
            await pool.query(
                'UPDATE habits SET completed = true, last_completed = CURRENT_DATE, streak = streak + 1 WHERE id = $1',
                [id]
            );
        } else {
            
            await pool.query(
                'UPDATE habits SET completed = false, streak = GREATEST(0, streak - 1) WHERE id = $1',
                [id]
            );
        }
        res.sendStatus(200); 
    } catch (err) {
        console.error('Erro ao atualizar:', err);
        res.status(500).json({ error: 'Erro ao atualizar hábito' });
    }
});


app.delete('/api/habits/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM habits WHERE id = $1', [id]);
        res.sendStatus(200);
    } catch (err) {
        console.error('Erro ao deletar:', err);
        res.status(500).json({ error: 'Erro ao deletar' });
    }
});


app.listen(port, () => {
    console.log(`🚀 Servidor Nuve rodando em http://localhost:${port}`);
});
