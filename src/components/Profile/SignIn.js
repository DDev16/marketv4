import React, { useState, useEffect } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { GrGoogle } from "react-icons/gr";
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, googleAuthProvider, signInWithPopup } from "../../utils/Firebase.js";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import bgImage from "../../assets/stock_back_low.gif";


const fadeIn = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: url(${bgImage}) no-repeat center center fixed; 
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  animation: ${fadeIn} 0.5s ease;
`;


const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 450px;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
  transition: 0.3s;
  background: #ffffff;
  margin-top: 150px;
  margin-bottom: 100px;
`;

const MockImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 10px 10px 0 0;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  color: #324d67;
  font-size: 2.5em;
  margin-bottom: 10px;
  font-weight: 600;
  text-align: center;
`;

const Description = styled.p`
  color: #324d67;
  font-size: 1em;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 400;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  margin: 1em 0;
`;

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1em;
  padding: 0.5em;
  border-bottom: 2px solid #ddd;
  transition: border-bottom 0.3s ease-in-out;

  &:focus-within {
    border-bottom: 2px solid #324d67;
  }
`;

const Input = styled.input`
  flex-grow: 1;
  border: none;
  outline: none;
  font-size: 1em;
  color: #324d67;
  margin-left: 10px;
`;

const Button = styled.button`
  padding: 0.5em 1em;
  color: #fff;
  font-size: 1em;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 15px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }
`;

const GoogleButton = styled(Button)`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #db4437;
  margin-bottom: 20px;

  &:hover {
    background-color: #c23321;
  }
`;

const Error = styled.p`
  color: ${props => props.error ? '#ff0000' : '#f00'};
  text-align: center;
  transition: color 0.3s ease;
`;

const ToggleButton = styled.button`
  background: transparent;
  border: none;
  color: #324d67;
  cursor: pointer;
  font-size: 0.9em;
  margin-top: 10px;
  transition: color 0.3s ease;

  &:hover {
    color: #007bff;
  }
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SignIn = ({ setUser }) => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(userAuth => {
      if (userAuth) {
        const user = {
          uid: userAuth.uid,
          email: userAuth.email
        };
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return unsubscribe;
  }, [setUser]);

  const handleSignUp = async (event) => {
    event.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError(handleErrorMessage(error.code));
    }
  };

  const handleSignIn = async (event) => {
    event.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError(handleErrorMessage(error.code));
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (error) {
      setError(handleErrorMessage(error.code));
    }
  };

  const handleErrorMessage = (code) => {
    switch(code) {
      case 'auth/invalid-email':
        return 'Invalid email format.';
      case 'auth/user-disabled':
        return 'This user is disabled.';
      case 'auth/user-not-found':
        return 'No user with this email found.';
      case 'auth/wrong-password':
        return 'Wrong password.';
      case 'auth/email-already-in-use':
        return 'The email address is already in use by another account.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled.';
      case 'auth/weak-password':
        return 'The password is too weak.';
      default:
        return 'An unknown error occurred.';
    }
  }

  return (
    <Wrapper>
      <LoginContainer>
        <MockImage src="https://source.unsplash.com/random/450x200?psychedelic" alt="Login Mockup"/>

        <Title>{isSignIn ? "Sign In" : "Sign Up"}</Title>
        <Description>Enter your credentials to {isSignIn ? "sign in" : "sign up"}</Description>

        <GoogleButton onClick={signInWithGoogle}>
          <GrGoogle /> Sign in with Google
        </GoogleButton>
        <Form onSubmit={isSignIn ? handleSignIn : handleSignUp}>
          <InputGroup>
            <FaEnvelope />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </InputGroup>
          <InputGroup>
            <FaLock />
            <Input
              type={passwordVisibility ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
            <div onClick={() => setPasswordVisibility(!passwordVisibility)}>
              {passwordVisibility ? <FaEyeSlash /> : <FaEye />}
            </div>
          </InputGroup>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <LoadingWrapper>
                {/* Put your loading spinner or any loading component here */}
                Loading...
              </LoadingWrapper>
            ) : (
              isSignIn ? "Sign In" : "Sign Up"
            )}
          </Button>
          <ToggleButton onClick={() => setIsSignIn(!isSignIn)}>
            {isSignIn ? "Don't have an account? Sign Up" : "Have an account? Sign In"}
          </ToggleButton>
        </Form>
        <Error error={error}>{error}</Error>
      </LoginContainer>
    </Wrapper>
  );
};

export default SignIn;