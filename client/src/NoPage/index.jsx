import React from 'react';

const NotFound = () => {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#e6e1ff', // Light purple background color
    color: '#7f5af0', // Dark purple text color
    fontFamily: 'Arial, sans-serif',
  };

  const headingStyle = {
    fontSize: '2em',
    marginBottom: '20px',
  };

  const imageStyle = {
    width: '50%',
    maxWidth: '400px',
    marginBottom: '20px',
  };

  const textStyle = {
    fontSize: '1.2em',
    textAlign: 'center',
  };

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>404 - Not Found</h1>
      <p style={textStyle}>cd
        Oops! The page you are looking for might be under construction or does not exist.
      </p>
    </div>
  );
};

export default NotFound;
