import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const RotatingSphere = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();

    const loader = new THREE.TextureLoader();
    loader.load('/background.jpg',
      (texture) => {
        const geometry = new THREE.SphereGeometry(500, 32, 32);
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.BackSide
        });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error) => {
        console.log('An error happened', error);
      }
    );
    
    camera.position.z = 5;
    let angle = 0;
    const radius = 5;

    const animate = () => {
      requestAnimationFrame(animate);

      // Increase the angle over time
      angle += 0.001;

      // Update the camera's position in a circular path around the origin
      camera.position.x = radius * Math.sin(angle);
      camera.position.z = radius * Math.cos(angle);

      // Ensure the camera is always looking at the origin
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    if (containerRef.current) {
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      containerRef.current.appendChild(renderer.domElement);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default RotatingSphere;
