const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // For serving static files

const filePath = path.join(__dirname, 'username.txt'); // Path to store messages
// Check if file exists, if not, create it
if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, ''); // Create an empty file
}

// Serve chat page and show mesages
app.get('/', (req, res) => {
    // Read existing messages from the file and display them
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.log('Error reading file:', err);
            data = "No chat exists.";
        }
        // Render the chat page with the messages and the send message form
        res.send(`
            <h1>Chat</h1>
            <div>${data.replace(/\n/g, '<br>')}</div>
            <form action="/" method="POST">
                <input type="hidden" id="username" name="username">
                <textarea name="message" placeholder="Type your message" required></textarea><br>
                <button type="submit">Send</button>
            </form>
            <form action="/clear-chat" method="POST">
                <button type="submit">Clear Chat</button>
            </form>
            <script>
                // Ensure the username is correctly retrieved from localStorage
                if (localStorage.getItem('username')) {
                    document.getElementById('username').value = localStorage.getItem('username');
                } else {
                    alert('Please log in first.');
                    window.location.href = '/login';
                }
            </script>
        `);
    });
});

// Handle sending message
app.post('/', (req, res) => {
    const { username, message } = req.body;

    // Check if username is undefined or empty
    if (!username || username === 'undefined') {
        return res.send('Please log in first');
    }

    // Log the data for debugging purposes
    console.log('Received message:', username, message);

    // Append the username and message to the file
    fs.appendFile(filePath, `${username}: ${message}\n`, (err) => {
        if (err) {
            console.log('Error writing to file:', err);
            return res.send('Error saving the message');
        }
        console.log('Message saved successfully');
        res.redirect('/');
    });
});

// Handle chat clearing
app.post('/clear-chat', (req, res) => {
    // Clear the content of the username.txt file
    fs.writeFile(filePath, '', (err) => {
        if (err) {
            console.log('Error clearing chat:', err);
            return res.send('Error clearing chat');
        }
        console.log('Chat cleared successfully');
        res.redirect('/');
    });
});

// Render the login form
app.get('/login', (req, res) => {
    res.send(`
        <h1>Login</h1>
        <form action="/login" method="POST">
            <input type="text" id="usernameInput" name="username" placeholder="Enter your username" required><br>
            <button type="submit">Login</button>
        </form>
        <script>
            // Store the username in localStorage when the user types it
            document.getElementById('usernameInput').addEventListener('input', (e) => {
                localStorage.setItem('username', e.target.value);
            });
        </script>
    `);
});

// Handle login and redirect to chat
app.post('/login', (req, res) => {
    const { username } = req.body;

    // Store the username in localStorage
    if (username) {
        res.redirect('/');
    } else {
        res.send('Please enter a valid username.');
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
