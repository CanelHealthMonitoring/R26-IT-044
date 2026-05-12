# IoT Based Canal Health Monitoring System Using Edge Computing for Siltation

**Project Group:** R26-IT-044
**Institution:** Sri Lanka Institute of Information Technology (SLIIT)

## 1. Project Overview

Irrigation canals often suffer from mud buildup and water pollution, which leads to a poor water supply and hurts crop production. Currently, canal monitoring relies primarily on manual checks. This process is slow, meaning problems are discovered too late. Existing smart monitoring systems are inadequate as they require strong internet connections that fail in rural areas, and they often send confusing raw data that is difficult for end-users to interpret.

**Proposed Architecture:**
The proposed solution is an IoT system that processes data locally at the canal instead of relying on the cloud. Sensors measure parameters such as water depth and clarity, allowing the edge devices to instantly calculate simple Canal Health Index (CHI) and Canal Water Quality Index (CWQI) scores. The edge devices filter the data locally and transmit important updates using a wireless LoRa network, ensuring continuous operation even in the absence of mobile internet. All finalized information is sent to a map-based web dashboard to assist irrigation authorities and farmers in making quick decisions.

---

## 2. System Modules

### 2.1 Canal Health Monitoring & CHI Classification
* **Data Collection:** Sensors collect real-time canal data including water depth, flow rate, and turbidity.
* **Depth & Sludge Analysis:** The system compares the current canal depth with a baseline to identify sediment accumulation.
* **Index Calculation:** The Canal Health Index (CHI) is computed using a weighted formula. The weights are assigned as 40% for the flow score, 35% for the turbidity score, and 25% for the sludge score.
* **Classification:** The final CHI value is mapped to health bands: Healthy, Moderate, Poor, or Critical.

### 2.2 Canal Water Quality Monitoring & CWQI Classification
* **Data Collection:** Sensors collect real-time canal data for pH, Electrical Conductivity (EC), and Temperature.
* **Index Calculation:** The Canal Water Quality Index (CWQI) is computed using a weighted formula. The weighting consists of EC at 50%, pH at 37.5%, and Temperature at 12.5%.
* **Contamination Profiling:** Rule-based logic on the ESP32 classifies the water as having Organic, Chemical, or Mixed contamination. 
* **Classification:** The CWQI is mapped to statuses of Healthy (≥80), Warning (60–79), or Critical (<60).

### 2.3 IoT-Based Edge Data Aggregation
* **Architecture:** The module is designed for reliable data transmission utilizing a LoRa-based multi-hop communication architecture. This bypasses unreliable cellular networks and is capable of relaying data up to 15km through a private LoRa mesh path.
* **Hardware Nodes:** Culvert Mini Nodes equipped with ESP32 microcontrollers and LoRa modules are deployed along the canals. A Raspberry Pi Zero serves as the centralized base station, gathering payloads and forwarding processed sensor data to a cloud server via Wi-Fi.
* **Network Health Tracking:** A Multi-Criteria Decision Analysis (MCDA) Algorithm evaluates network stability by assessing Received Signal Strength Indicator (RSSI), Signal-to-Noise Ratio (SNR), and Packet Loss.

### 2.4 Smart Web Dashboard & Infrastructure ML
* **Web Interface:** The Canal IQ Website features an interactive map with colour-coded IoT nodes and pop-up CHI/CWQI sensor breakdowns.
* **Analytics:** Includes a dashboard with live node summaries, status distribution pie charts, seasonal analysis (Yala vs Maha), and PDF report generation.
* **Predictive Maintenance:** The admin panel is integrated with a Machine Learning model for infrastructure health predictions. After testing three models on parameters like CPU and memory usage, Random Forest was selected as the best-performing model, achieving an 80.64% accuracy rate.

---

## 3. Hardware Requirements

* ESP32-S3-N16R8 & ESP32-C3 SuperMini
* Raspberry Pi Zero
* Ra-02 LoRa Module
* JSN-SR04T Waterproof Ultrasonic Distance Measuring Module
* YF-S201 Water Flow Sensor
* Analog TDS Water Conductivity Sensor
* Turbidity Sensor
* pH Sensor with probe
* DS18B20 Waterproof Digital Temperature Sensor
* AC-DC 5V Isolated Switching Power Supply Step down Module
* LM2596 DC-DC Buck Converter

---

## 4. Research Team

* **CHANDRAGUPTHA H.A.T** (IT22091970) – Canal Health Monitoring & Canal Health Index (CHI) Classification
* **Pasindu W.G.V** (IT22273512) – Canal Water Quality Monitoring & Contamination Classification
* **Sanjana K.G.T.S** (IT22224170) – IoT-Based Edge Data Aggregation module 
* **Viduranga S.P.S** (IT22215192) – Smart Web Based System Health Monitoring Dashboard

---
