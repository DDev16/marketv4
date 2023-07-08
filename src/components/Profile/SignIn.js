import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { GrGoogle } from "react-icons/gr";
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, googleAuthProvider, signInWithPopup } from "../../utils/Firebase.js";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f4f4f4;
`;

const Title = styled.h1`
  color: #333;
  font-size: 2.5em;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  margin: 1em 0;
  width: 300px;
`;

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1em;
  padding: 0.5em;
  border: 1px solid #ddd;
  border-radius: 5px;
`;

const Input = styled.input`
  flex-grow: 1;
  border: none;
  outline: none;
  font-size: 1em;
  color: #333;
`;

const Button = styled.button`
  padding: 0.5em 1em;
  color: #fff;
  font-size: 1em;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const GoogleButton = styled(Button)`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #db4437;

  &:hover {
    background-color: #c23321;
  }
`;

const Error = styled.p`
  color: #f00;
  text-align: center;
`;

const SignIn = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

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
      <Title>Sign In</Title>
      <GoogleButton onClick={signInWithGoogle}>
        <GrGoogle /> Sign in with Google
      </GoogleButton>
      <Form onSubmit={handleSignUp}>
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
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </InputGroup>
        <Button type="submit">Sign Up</Button>
      </Form>
      <Form onSubmit={handleSignIn}>
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
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </InputGroup>
        <Button type="submit">Sign In</Button>
      </Form>
      {error && <Error>{error}</Error>}
    </Wrapper>
  );
};

export default SignIn;
