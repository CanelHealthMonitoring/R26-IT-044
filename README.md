# IoT-Based Canal Health Monitoring System Using Edge Computing for Siltation 🌊🛰️

[![Project Phase](https://img.shields.io/badge/Project-Phase%20II-blue.svg)](#)
[![Hardware](https://img.shields.io/badge/Hardware-ESP32%20%7C%20Raspberry%20Pi-green.svg)](#)
[![Network](https://img.shields.io/badge/Network-LoRa%20Mesh-orange.svg)](#)
[![Machine Learning](https://img.shields.io/badge/ML-Random%20Forest-yellow.svg)](#)

[cite_start]**Research Group:** R26-IT-044 [cite: 2]

## 📖 Project Overview

[cite_start]Irrigation canals frequently suffer from mud buildup and water pollution, leading to poor water supply and hurting crop production[cite: 27]. [cite_start]Traditional canal monitoring relies on slow manual checks, causing critical problems to be discovered too late[cite: 28, 29]. [cite_start]Existing smart monitoring systems are often flawed because they require strong internet connections that fail in rural areas and provide raw, confusing data to end-users[cite: 30, 31].

**Our Solution:**
[cite_start]We built an IoT system that processes data locally at the edge rather than relying on cloud computing[cite: 33]. [cite_start]The system calculates simple Canal Health Index (CHI) and Canal Water Quality Index (CWQI) scores directly from sensor readings[cite: 34]. [cite_start]Utilizing a wireless LoRa network, the devices filter data locally and function without mobile internet[cite: 35]. [cite_start]The processed information is sent to an easy-to-use, map-based web dashboard (Canal IQ) to help farmers and irrigation officers make quick, informed decisions[cite: 36, 482].

---

## ✨ Core Modules & Features

### [cite_start]1. Canal Health Monitoring & CHI Classification [cite: 38, 39]
* [cite_start]**Real-Time Sensing:** Collects data on water depth, flow rate, and turbidity[cite: 44].
* [cite_start]**Sludge Detection:** Computes depth loss to identify sediment and sludge accumulation[cite: 49, 50].
* [cite_start]**CHI Master Formula:** Calculates a health score weighted at 40% for flow rate, 35% for turbidity, and 25% for sludge depth[cite: 93].
* [cite_start]**Classification:** Maps conditions into four bands: Healthy (≥80), Moderate (60-79), Poor (40-59), and Critical (<40)[cite: 154, 155, 157, 158, 160, 161, 163, 164].

### [cite_start]2. Canal Water Quality Monitoring & CWQI Classification [cite: 194, 195]
* [cite_start]**Parameter Tracking:** Monitors pH, Electrical Conductivity (EC), and Temperature[cite: 200].
* [cite_start]**CWQI Formula:** Computes a water quality score weighted at 50% for EC, 37.5% for pH, and 12.5% for temperature[cite: 242].
* [cite_start]**Contamination Profiling:** Uses rule-based logic to classify contamination as Organic, Chemical, or Mixed[cite: 211, 212].
* [cite_start]**Alert System:** Triggers instant alerts to farmers for critical contamination states[cite: 221].

### [cite_start]3. IoT-Based Edge Data Aggregation [cite: 338]
* [cite_start]**LoRa Architecture:** Utilizes a private LoRa-based multi-hop mesh network to bypass unreliable cellular networks[cite: 409].
* [cite_start]**Long-Range Transmission:** Capable of relaying data up to 15km using low-power Culvert Mini Nodes[cite: 410, 411].
* [cite_start]**Central Edge Hub:** A Raspberry Pi Zero serves as the base station, gathering LoRa payloads and forwarding processed data to the cloud via Wi-Fi[cite: 413, 414].
* [cite_start]**Network Health:** Implements a Multi-Criteria Decision Analysis (MCDA) algorithm to track network stability using RSSI, SNR, and Packet Loss[cite: 340, 342, 345, 348].

### [cite_start]4. Smart Web Dashboard & Infrastructure ML [cite: 431, 433]
* [cite_start]**Canal IQ Dashboard:** Features an interactive map with colour-coded IoT nodes and pop-up sensor breakdowns[cite: 482, 483, 484].
* [cite_start]**Seasonal Analysis:** Compares metrics across Yala and Maha seasons with automated PDF report generation[cite: 485, 486].
* [cite_start]**Predictive Maintenance:** Uses a Random Forest ML model (80.64% accuracy) to automatically monitor system infrastructure performance (CPU, Memory, Query response time) and predict slowdowns[cite: 434, 436, 476, 477].
* [cite_start]**Bilingual UI:** Supports English and Sinhala with a responsive, glassmorphism design[cite: 488].

---

## 🛠️ Hardware Stack

* [cite_start]**Microcontrollers:** ESP32-S3-N16R8 [cite: 327] [cite_start]& ESP32-C3 SuperMini [cite: 425, 426]
* [cite_start]**Base Station:** Raspberry Pi Zero [cite: 421]
* [cite_start]**Communication:** Ra-02 LoRa Modules [cite: 420]
* [cite_start]**Power:** AC-DC 5V Isolated Switching Power Supply Step down Modules & LM2596 DC-DC Buck Converters [cite: 322, 422]
* **Sensors:**
  * [cite_start]JSN-SR04T Waterproof Ultrasonic Sensor (Depth/Sludge) [cite: 324]
  * [cite_start]YF-S201 Water Flow Sensor [cite: 329]
  * [cite_start]Analog TDS Water Conductivity Sensor (EC) [cite: 325]
  * [cite_start]Turbidity Sensor [cite: 326]
  * [cite_start]pH Sensor with probe [cite: 323]
  * [cite_start]DS18B20 Waterproof Digital Temperature Sensor [cite: 328]

---

## [cite_start]🧑‍💻 Team Members [cite: 4]

| Name | Student ID | Component |
| :--- | :--- | :--- |
| [cite_start]**Chandraguptha H.A.T** [cite: 40] | [cite_start]IT22091970 [cite: 40] | [cite_start]Canal Health Monitoring & CHI [cite: 38, 39] |
| [cite_start]**Pasindu W.V.G** [cite: 196] | [cite_start]IT22273512 [cite: 196] | [cite_start]Canal Water Quality & Contamination [cite: 194, 195] |
| [cite_start]**Sanjana K.G.T.S** [cite: 339] | [cite_start]IT22224170 [cite: 339] | [cite_start]IoT-Based Edge Data Aggregation [cite: 338] |
| [cite_start]**Viduranga S.P.S** [cite: 432] | [cite_start]IT22215192 [cite: 432] | [cite_start]Smart Web Dashboard & Infrastructure ML [cite: 431, 433] |

---
