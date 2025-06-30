function Register() {
  return (
    <div style={pageStyle}>
      <div className="container" style={containerStyle}>
        <h1 style={titleStyle}>הרשמה </h1>
        <p style={textStyle}>בקרוב - טופס הרשמה יופיע כאן</p>
      </div>
    </div>
  )
}

const pageStyle = {
  minHeight: '60vh',
  padding: '4rem 0'
}

const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 20px',
  textAlign: 'center'
}

const titleStyle = {
  fontSize: '2.5rem',
  color: '#2c3e50',
  marginBottom: '1rem'
}

const textStyle = {
  fontSize: '1.1rem',
  color: '#7f8c8d'
}

export default Register