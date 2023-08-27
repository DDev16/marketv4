import React, { useState, useEffect } from 'react';
import "../../components/courses/learning.css"


const LearningPlatform = () => {
  const [courses, setCourses] = useState([
    {
      id: 1,
      title: 'Introduction to Blockchain',
      content: 'Blockchain is a decentralized distributed ledger that records transactions across multiple computers. In this course, you will learn the fundamentals of blockchain technology.',
      instructor: 'John Doe',
      imageUrl: 'https://source.unsplash.com/random/450x200?psychedelic',
      slides: [
        {
            id: 1,
            title: 'Understanding Blockchain',
            content: 'Blockchain is a decentralized distributed ledger that records transactions across multiple computers. The defining feature is its ability to ensure secure, transparent, and tamper-proof transactions, facilitated by cryptographic hashing, block time-stamps, and a consensus protocol. Blockchain technology forms the foundation for cryptocurrencies, but its use extends to sectors like supply chain management, healthcare, and finance.',
          },
          {
            id: 2,
            title: 'Core Principles of Blockchain',
            content: 'Decentralization, Transparency, and Immutability are the core principles of blockchain. Decentralization ensures no single entity has control, enhancing security and resilience. Transparency makes all transactions visible to all participants, fostering trust and accountability. Immutability implies that once data is added to the blockchain, it cannot be altered or deleted, ensuring data integrity and trust.',
          },
          {
            id: 3,
            title: 'Applications of Blockchain',
            content: 'Blockchain offers a broad range of applications beyond cryptocurrencies. In supply chain management, it ensures traceability and authenticity. In healthcare, it provides secure patient data management. In finance, blockchain enables faster, cheaper, and more transparent transactions. These are just a few examples, and the potential use cases for blockchain are vast and continually expanding.',
          },
          
      ],
      questions: [
        {
          id: 1,
          text: 'What is a blockchain?',
          options: [
            { id: 'a', text: 'A decentralized ledger' },
            { id: 'b', text: 'A type of cryptocurrency' },
            { id: 'c', text: 'A digital signature' },
          ],
          correctAnswer: 'a',
          explanation: 'Correct! A blockchain is a decentralized ledger that records transactions across multiple computers.',
          moreInfo: 'To learn more about blockchain technology, you can visit the following resources: [insert relevant links here].',
        },
        {
          id: 2,
          text: 'What is a smart contract?',
          options: [
            { id: 'a', text: 'A legally binding agreement' },
            { id: 'b', text: 'An encrypted message' },
            { id: 'c', text: 'A self-executing program' },
          ],
          correctAnswer: 'c',
          explanation: 'Correct! A smart contract is a self-executing program with the terms of the agreement directly written into code.',
          moreInfo: 'To explore smart contracts further, you can refer to the following resources: [insert relevant links here].',
        },
      ],
    },
    {
      id: 2,
      title: 'Blockchain Security',
      content: 'Blockchain security is a critical aspect of maintaining the integrity and trustworthiness of blockchain networks. In this course, you will learn about various security threats and measures to protect blockchain systems.',
      instructor: 'Alice Johnson',
      imageUrl: 'https://source.unsplash.com/random/450x200?psychedelic',
      slides: [
        {
          id: 1,
          title: 'Introduction to Blockchain Security',
          content: 'Blockchain is a decentralized and distributed digital ledger that records transactions across many computers in such a way that the registered transactions cannot be altered retroactively. Security in blockchain is crucial because it underpins trust and functionality in the system. Blockchain maintains its security through complex cryptographic algorithms and consensus mechanisms.',
        },
        {
          id: 2,
          title: 'Threats to Blockchain Security',
          content: 'There are several threats to blockchain security. The "51% Attack" can occur when an entity gains control of the majority of the network’s mining power, enabling them to double-spend coins and prevent other miners from validating blocks. The "Sybil Attack" happens when a malicious node creates multiple false identities to gain undue influence over the network. The "Replay Attack" involves an attacker retransmitting or delaying a valid data transmission for fraudulent purposes. Other potential threats include phishing, malware, and software bugs.',
        },
        {
          id: 3,
          title: 'Cryptography in Blockchain',
          content: 'Cryptography is an essential aspect of blockchain security. Each user on the blockchain has a pair of keys: a public key, which is open to all other users on the network, and a private key, which is known only to the user. The private key is a cryptographic code that allows a user to access their cryptocurrency and authorize transactions. Losing this key means losing access to your assets on the blockchain.',
        },
        {
          id: 4,
          title: 'Protecting Blockchain Systems',
          content: 'To protect blockchain systems, strong consensus mechanisms like Proof of Work (PoW) or Proof of Stake (PoS) are used to keep the network decentralized and prevent malicious attacks. Regular audits and updates can prevent software bugs. Awareness and caution can help prevent phishing and malware attacks. Also, proper management of private keys is essential to ensure that only authorized transactions are processed.',
        },
      ],
      questions: [
        {
          id: 1,
          text: 'What is a 51% attack?',
          options: [
            { id: 'a', text: 'When more than half of the nodes in a blockchain network are compromised' },
            { id: 'b', text: 'When an attacker controls more than 51% of the network\'s mining power' },
            { id: 'c', text: 'When a blockchain network reaches 51% consensus on a new block' },
          ],
          correctAnswer: 'b',
          explanation: 'Correct! A 51% attack occurs when an attacker controls more than 51% of the network\'s mining power, which allows them to manipulate the blockchain.',
          moreInfo: 'To learn more about blockchain security and 51% attacks, you can refer to the following resources: [insert relevant links here].',
        },
        {
          id: 2,
          text: 'What is a private key?',
          options: [
            { id: 'a', text: 'A password used to access a blockchain wallet' },
            { id: 'b', text: 'A unique identifier for a blockchain transaction' },
            { id: 'c', text: 'A cryptographic key that enables access to a blockchain address' },
          ],
          correctAnswer: 'c',
          explanation: 'Correct! A private key is a cryptographic key that enables access to a specific blockchain address and is used to sign transactions.',
          moreInfo: 'To explore private keys and their role in blockchain security, you can refer to the following resources: [insert relevant links here].',
        },
      ],
    },
    {
      id: 3,
      title: 'Decentralized Applications (DApps)',
      content: 'Decentralized applications (DApps) leverage blockchain technology to enable transparent, secure, and censorship-resistant applications. In this course, you will explore the development and deployment of DApps.',
      instructor: 'Bob Smith',
      slides: [
        {
          
          id: 1,
          title: 'Understanding Decentralized Applications (DApps)',
          content: 'A Decentralized Application, or DApp, is a software application that runs on a distributed computing system like a blockchain. Unlike traditional apps where the backend code is running on centralized servers, DApps have their backend code running on a decentralized peer-to-peer network. DApps, because of their decentralized nature, are transparent, secure, and resistant to censorship.',
      
        },
        {
            id: 2,
            title: 'Components of a DApp',
            content: 'DApps consist of the front-end, which can be any user interface written in any language, and the backend, which is stored on the blockchain and is represented by smart contracts. Smart contracts are self-executing contracts with the terms of the agreement directly written into code. These contracts define the rules and logic of the DApps operations.',
        },
        {
            id: 3,
            title: 'Building and Deploying DApps',
            content: 'DApps are primarily built using a blockchain like Ethereum, which has native support for smart contracts. Developers use languages like Solidity or Vyper to write the smart contracts. These contracts are then deployed on the blockchain network where they can be interacted with using the applications front-end. DApp development also requires thorough testing and security measures due to the immutable and transparent nature of the blockchain.',
        },
      ],
      questions: [
        {
          id: 1,
          text: 'What is a DApp?',
          options: [
            { id: 'a', text: 'A distributed application that runs on multiple servers' },
            { id: 'b', text: 'A mobile application that integrates with blockchain technology' },
            { id: 'c', text: 'A decentralized application that runs on a blockchain network' },
          ],
          correctAnswer: 'c',
          explanation: 'Correct! A DApp is a decentralized application that runs on a blockchain network, providing transparency and security.',
          moreInfo: 'To learn more about DApps and their development, you can visit the following resources: [insert relevant links here].',
        },
        {
          id: 2,
          text: 'What is the role of a smart contract in a DApp?',
          options: [
            { id: 'a', text: 'To handle user authentication and authorization' },
            { id: 'b', text: 'To provide a user interface for interacting with the DApp' },
            { id: 'c', text: 'To define the logic and rules of the DApp\'s operations' },
          ],
          correctAnswer: 'c',
          explanation: 'Correct! A smart contract defines the logic and rules of a DApp\'s operations, enabling it to execute autonomously on the blockchain.',
          moreInfo: 'To explore the role of smart contracts in DApps, you can refer to the following resources: [insert relevant links here].',
        },
      ],
    },
    {
      id: 4,
      title: 'Blockchain Scalability',
      content: 'Scalability is a major challenge in blockchain technology, as it needs to handle a large number of transactions efficiently. In this course, you will learn about different scalability solutions and approaches in blockchain systems.',
      instructor: 'Eve Davis',
      slides: [
        {
          id: 1,
          title: 'Understanding Blockchain Scalability',
          content: 'Blockchain scalability refers to the ability of a blockchain to handle a large number of transactions per second (TPS) and grow in size without sacrificing speed, performance, or security. The blockchain scalability problem, also known as a scalability bottleneck, is a limitation in the throughput of a blockchain, which can slow down transaction processing times and limit the overall efficiency of a network.',
        },
        {
          id: 2,
          title: 'Challenges in Blockchain Scalability',
          content: 'The primary scalability challenge in blockchain systems is maintaining speed and efficiency while ensuring security and decentralization. For instance, increasing the block size can improve transaction speed but may also centralize power among miners with greater resources. Similarly, reducing the time between blocks can lead to more forks, impacting the security of the network.',
        },
        {
          id: 3,
          title: 'Solutions for Blockchain Scalability',
          content: 'Several solutions have been proposed to address the scalability issue in blockchains. "Layer 2" solutions are protocols built on top of an existing blockchain to improve its scalability. They process transactions off the main chain (off-chain) to reduce the load. Examples of layer 2 solutions include the Lightning Network for Bitcoin and the Plasma and Rollups protocols for Ethereum. Other solutions involve modifying the consensus algorithm or block parameters, but these can have implications for security and decentralization.',
        },
      ],
      questions: [
        {
          id: 1,
          text: 'What is a scalability bottleneck in blockchain systems?',
          options: [
            { id: 'a', text: 'A limitation in the number of users that can participate in a blockchain network' },
            { id: 'b', text: 'A limitation in the throughput or capacity of a blockchain network' },
            { id: 'c', text: 'A limitation in the security and privacy of blockchain transactions' },
          ],
          correctAnswer: 'b',
          explanation: 'Correct! A scalability bottleneck in blockchain systems refers to a limitation in the throughput or capacity of the network, leading to slower transaction processing.',
          moreInfo: 'To learn more about blockchain scalability and different solutions, you can refer to the following resources: [insert relevant links here].',
        },
        {
          id: 2,
          text: 'What is a layer 2 solution for blockchain scalability?',
          options: [
            { id: 'a', text: 'A secondary blockchain network that operates independently of the main blockchain' },
            { id: 'b', text: 'A protocol or framework built on top of an existing blockchain to improve scalability' },
            { id: 'c', text: 'A consensus algorithm that allows for faster block creation and transaction confirmation' },
          ],
          correctAnswer: 'b',
          explanation: 'Correct! A layer 2 solution is a protocol or framework built on top of an existing blockchain to improve scalability by processing transactions off-chain.',
          moreInfo: 'To explore layer 2 solutions for blockchain scalability, you can refer to the following resources: [insert relevant links here].',
        },
      ],
    },
    {
      id: 5,
      title: 'Blockchain Governance',
      content: 'Blockchain governance refers to the decision-making processes and structures that govern blockchain networks. In this course, you will explore different models of blockchain governance and their implications.',
      instructor: 'Charlie Wilson',
      slides: [
        {
          id: 1,
          title: 'Understanding Blockchain Governance',
          content: 'Blockchain governance refers to the system of rules, practices, and decision-making processes by which blockchain networks operate and evolve. It involves the ways in which stakeholders, such as miners, developers, users, and validators, participate in decision-making. Key issues in blockchain governance include how decisions are made, who gets to participate in decision-making, and how conflicts are resolved.',
        },
        {
          id: 2,
          title: 'On-Chain and Off-Chain Governance',
          content: 'On-chain governance is a model in which decision-making processes are written directly into the blockchain protocol. In this model, changes to the protocol, such as updates or upgrades, are proposed and voted on by stakeholders directly on the blockchain. This allows for transparent, auditable, and automated decision-making. Conversely, off-chain governance involves decision-making processes that occur outside of the blockchain protocol, such as through social consensus or centralized authorities.',
        },
        {
          id: 3,
          title: 'The Role of Decentralized Autonomous Organizations (DAOs) in Governance',
          content: 'Decentralized Autonomous Organizations (DAOs) are an essential part of blockchain governance. DAOs are organizations represented by rules encoded as a computer program that are transparent and controlled by the organization members and not by a centralized authority. They enable direct and democratic decision-making, where stakeholders can propose and vote on decisions related to the organization or protocol. DAOs facilitate community participation and can provide a model for more decentralized and democratic governance.',
        },
      ],
      
      questions: [
        {
          id: 1,
          text: 'What is on-chain governance?',
          options: [
            { id: 'a', text: 'A governance model that relies on off-chain decision-making processes' },
            { id: 'b', text: 'A governance model that allows stakeholders to participate and vote directly on-chain' },
            { id: 'c', text: 'A governance model that is managed by a centralized authority or organization' },
          ],
          correctAnswer: 'b',
          explanation: 'Correct! On-chain governance allows stakeholders to participate and vote directly on-chain, enabling a more decentralized decision-making process.',
          moreInfo: 'To learn more about blockchain governance models, including on-chain and off-chain approaches, you can refer to the following resources: [insert relevant links here].',
        },
        {
          id: 2,
          text: 'What is the role of a DAO in blockchain governance?',
          options: [
            { id: 'a', text: 'To enforce compliance with regulatory standards' },
            { id: 'b', text: 'To facilitate community participation and decision-making' },
            { id: 'c', text: 'To validate and confirm transactions on the blockchain' },
          ],
          correctAnswer: 'b',
          explanation: 'Correct! A DAO (Decentralized Autonomous Organization) facilitates community participation and decision-making in blockchain governance processes.',
          moreInfo: 'To explore the role of DAOs in blockchain governance, you can refer to the following resources: [insert relevant links here].',
        },
      ],
    },
  ]);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const handleCourseSelection = (course) => {
    setSelectedCourse(course);
    setCurrentStep(0);
    setSelectedAnswers({});
    setShowExplanation(false);
    setQuizResult(null);
    setQuizStarted(false);
    setTimeLeft(0);
    setQuizCompleted(false);
  };
  const handleStartQuiz = () => {
    setQuizStarted(true);
    setTimeLeft(1800); // 30 minutes in seconds
  };
  const handleQuizSubmit = () => {
    calculateQuizResult();
    setQuizCompleted(true);
  };

  const calculateQuizResult = () => {
    if (selectedCourse && selectedCourse.questions) {
      const questions = selectedCourse.questions;
      let correctCount = 0;

      for (const question of questions) {
        if (selectedAnswers[question.id] === question.correctAnswer) {
          correctCount++;
        }
      }

      const percentage = (correctCount / questions.length) * 100;
      setQuizResult(percentage);
    }
  };

  const handleNextQuestion = () => {
    setCurrentStep((prevStep) => prevStep + 1);
    setShowExplanation(false);
  };
  const handlePreviousQuestion = () => {
    setCurrentStep((prevStep) => prevStep - 1);
    setShowExplanation(false);
  };
  const handleOptionSelect = (questionId, optionId) => {
    setSelectedAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: optionId,
    }));
  };
  const renderQuizContent = () => {
    if (selectedCourse) {
      const { title, content, questions } = selectedCourse;
      if (quizCompleted) {
        return (
          <div className="quiz-result">
            <h3>Quiz Result</h3>
            <p>
              You scored {quizResult}% in the {title} quiz.
            </p>
          </div>
        );
      }
      if (quizStarted) {
        const currentQuestion = questions[currentStep];
        const isLastQuestion = currentStep === questions.length - 1;
        return (
          <div className="quiz-content">
            <h3>{currentQuestion.text}</h3>
            <div className="options">
              {currentQuestion.options.map((option) => (
                <div
                  key={option.id}
                  className={`option ${
                    selectedAnswers[currentQuestion.id] === option.id ? 'selected' : ''
                  }`}
                  onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
                >
                  {option.text}
                </div>
              ))}
            </div>
            {showExplanation && (
              <div className="explanation">
                <h4>Explanation:</h4>
                <p>{currentQuestion.explanation}</p>
                <p>{currentQuestion.moreInfo}</p>
              </div>
            )}
            <div className="navigation-buttons">
              {currentStep > 0 && (
                <button className="previous-button" onClick={handlePreviousQuestion}>
                  Previous
                </button>
              )}
              {!isLastQuestion && (
                <button className="next-button" onClick={handleNextQuestion}>
                  Next
                </button>
              )}
              {isLastQuestion && (
                <button className="submit-button" onClick={handleQuizSubmit}>
                  Submit
                </button>
              )}
            </div>
            <button className="explanation-button" onClick={() => setShowExplanation(!showExplanation)}>
              {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
            </button>
          </div>
        );
      }
      return (
        <div className="course-details">
          <h2>{title}</h2>
          <p>{content}</p>
          <button className="start-quiz-button" onClick={handleStartQuiz}>
            Start Quiz
          </button>
        </div>
      );
    }
    return null;
  };
  useEffect(() => {
    let timer;
    if (quizStarted && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    }

    if (timeLeft === 0) {
      calculateQuizResult();
      setQuizCompleted(true);
    }

    return () => clearTimeout(timer);
  }, [quizStarted, timeLeft]);

  return (
    <div className="learning-platform">
      <div className="learn-title">Earn To Learn Program</div>
       <div className="earn-to-learn">
                <p> ERC20 Reward not implementated yet, but will be soon ❤️   </p>
                <p>
                  Our "Earn to Learn" program is designed to encourage learning of blockchain technology among our community members. Through this program, you can earn company-issued ERC20 tokens by completing blockchain courses offered on this platform.
                </p>
                <p>
                  Here's how it works:
                </p>
                <ul>
                  <li>Choose a blockchain course from the list above and start learning.</li>
                  <li>Once you complete a course, you will be given a quiz to test your knowledge.</li>
                  <li>Successfully pass the quiz, and you will receive a reward in the form of our company's ERC20 tokens.</li>
                  <li>Collect and accumulate these tokens as you complete more courses, and you can use them for various incentives and benefits within the company.</li>
                </ul>
                <p>
                  The more you learn about blockchain technology, the more tokens you can earn. It's a win-win situation for both you and the company, as it fosters continuous learning and promotes expertise in this revolutionary technology.
                </p>
              </div>
      <div className="course-list">
        {courses.map((course) => (
          <div
            key={course.id}
            className={`course ${selectedCourse === course ? 'selected' : ''}`}
            onClick={() => handleCourseSelection(course)}
          >
            {course.title}
          </div>
        ))}
      </div>
      <div className="course-content">
        {selectedCourse && (
          <>
            <div className="course-details">
              <h2>{selectedCourse.title}</h2>
              <p>{selectedCourse.content}</p>
              
            </div>
            <div className="course-slides">
              {selectedCourse.slides.map((slide) => (
                <div key={slide.id} className="slide">
                  <h3>{slide.title}</h3>
                  <p>{slide.content}</p>
                </div>
              ))}
            </div>
            {renderQuizContent()}
            {quizStarted && (
              <div className="timer">
                Time Left: {Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? '0' : ''}
                {timeLeft % 60}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default LearningPlatform;