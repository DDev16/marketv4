import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import Card from 'react-bootstrap/Card';
import logoPlaceholder from '../../../../assets/flarelogo.png'; // Path to your logo placeholder
import styles from '../../../../components/Marketplace/Collection/Hot/HottestCollections.modules.css';

const collections = [
    { name: 'Collection 1' },
    { name: 'Collection 2' },
    { name: 'Collection 3' },
    // Add more collections here
];

const HottestCollections = () => {
    return (
        <div className="containerhot">
      <h2 className="headerhot">🔥 Hottest Collections 🔥</h2> 
        <Carousel showThumbs={false} showStatus={false} infiniteLoop useKeyboardArrows autoPlay>
            {collections.map((collection, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'center' }}>
                    <Card className="cardhot">
                        <Card.Img variant="top" src={logoPlaceholder} />
                        <Card.Body>
                            <Card.Title>{collection.name}</Card.Title>
                        </Card.Body>
                    </Card>
                    
                </div>
                
            ))}
        </Carousel>
        </div>
    );
}

export default HottestCollections;
