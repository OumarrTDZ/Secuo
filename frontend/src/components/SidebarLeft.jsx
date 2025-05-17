const SidebarLeft = () => {
    // Sidebar menu with navigation links
    return (
        <div style={{ width: '250px', background: '#eee', padding: '20px' }}>
            <h3>📩 Menu</h3>
            <ul>
                <li><a href="/chats">💬 Chats</a></li>
                <li><a href="/payments">💰 Payments</a></li>
            </ul>
        </div>
    );
};

export default SidebarLeft;
