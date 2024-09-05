// layout.jsx
import React from 'react';
import { ClerkProvider, RedirectToSignIn, useUser, SignOut } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import './styles.css'; // Import your global styles

const clerkFrontendApi = 'your-clerk-frontend-api'; // Replace with your Clerk Frontend API URL

const Layout = ({ children }) => {
  return (
    <ClerkProvider frontendApi={clerkFrontendApi}>
      <div className="layout-container">
        <Header />
        <main className="main-content">
          {children}
        </main>
        <Footer />
      </div>
    </ClerkProvider>
  );
};

const Header = () => {
  const { isSignedIn, user } = useUser();

  return (
    <header className="header">
      <nav className="nav">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/about" className="nav-link">About</Link>
        {isSignedIn ? (
          <>
            <span className="user-info">Welcome, {user.firstName}</span>
            <SignOut />
          </>
        ) : (
          <Link to="/sign-in" className="nav-link">Sign In</Link>
        )}
      </nav>
    </header>
  );
};

const Footer = () => {
  return (
    <footer className="footer">
      <p>&copy; 2024 Your Company. All rights reserved.</p>
    </footer>
  );
};

export default Layout;
