# IoT Based Canal Health Monitoring System Using Edge Computing for Siltation

**Project Group:** R26-IT-044  
**Institution:** Sri Lanka Institute of Information Technology (SLIIT)

---

## 1. Project Overview

Irrigation canals often suffer from mud buildup and water pollution, leading to reduced water flow and lower crop productivity. Current manual monitoring methods are slow and inefficient, causing delayed detection of issues.

To solve this, this project introduces an IoT-based edge computing system that processes sensor data locally at canal sites. It calculates Canal Health Index (CHI) and Canal Water Quality Index (CWQI) in real time using ESP32-based edge devices. Data is transmitted through a LoRa network to ensure reliable communication in rural areas without internet dependency. A centralized web dashboard visualizes all data for decision-making.

---

## 2. System Modules

### 2.1 Canal Health Monitoring & CHI Classification
- Collects water depth, flow rate, and turbidity data
- Detects sediment buildup by comparing baseline depth
- Computes CHI using weighted scoring:
  - Flow: 40%
  - Turbidity: 35%
  - Sludge: 25%
- Classifies canal condition as:
  - Healthy
  - Moderate
  - Poor
  - Critical

---

### 2.2 Canal Water Quality Monitoring & CWQI Classification
- Measures pH, Electrical Conductivity (EC), and Temperature
- Computes CWQI using weighted formula:
  - EC: 50%
  - pH: 37.5%
  - Temperature: 12.5%
- Detects contamination type:
  - Organic
  - Chemical
  - Mixed
- Status levels:
  - Healthy (≥80)
  - Warning (60–79)
  - Critical (<60)

---

### 2.3 IoT-Based Edge Data Aggregation
- Uses LoRa multi-hop communication (up to 15km range)
- ESP32-based sensor nodes deployed along canals
- Raspberry Pi Zero used as gateway
- MCDA algorithm evaluates network quality using:
  - RSSI
  - SNR
  - Packet Loss

---

### 2.4 Smart Web Dashboard & Machine Learning
- Interactive map-based dashboard for real-time monitoring
- Displays CHI and CWQI per node
- Includes analytics:
  - Seasonal comparisons (Yala vs Maha)
  - Status distribution charts
  - PDF report generation
- Predictive maintenance using ML (Random Forest model with 80.64% accuracy)

---

## 3. Hardware Requirements

- ESP32-S3-N16R8 & ESP32-C3 SuperMini  
- Raspberry Pi Zero  
- Ra-02 LoRa Module  
- JSN-SR04T Ultrasonic Sensor  
- YF-S201 Flow Sensor  
- TDS Sensor  
- Turbidity Sensor  
- pH Sensor  
- DS18B20 Temperature Sensor  
- Power Modules (LM2596, AC-DC Converter)

---

## 4. Research Team

- **CHANDRAGUPTHA H.A.T (IT22091970)** – Canal Health Monitoring & CHI System  
- **Pasindu W.G.V (IT22273512)** – Water Quality Monitoring & CWQI System  
- **Sanjana K.G.T.S (IT22224170)** – IoT Edge Data Aggregation  
- **Viduranga S.P.S (IT22215192)** – Web Dashboard & ML System  

---

## 5. Repository

GitHub Source Code:
https://github.com/CanelHealthMonitoring/R26-IT-044.git
