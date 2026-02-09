# Kubernetes Load Balancer Demo 🚀

A beginner-friendly Kubernetes project that **visually demonstrates load balancing** across multiple pods.

On every refresh, traffic may be served by a different backend pod — clearly proving how **Kubernetes Services distribute traffic automatically**.

---

## 🧠 What this demo shows

- Pods & Deployments  
- ReplicaSets  
- Kubernetes Service (load balancing)  
- Scaling pods from **1 → N**  
- Real traffic distribution behavior  
- Public exposure **without using any cloud provider**

---

## 🖥️ What you’ll see

    Hello from Pod
    backend-6bd4958886-x9abc

Refresh 🔄 → the pod name may change.

---

## 🎥 Demo Preview

Short video demonstrating Kubernetes Service load balancing.  
Each refresh may hit a different backend pod.

▶️ **Watch demo video**  
https://github.com/3009aksingh/k8s-loadbalancer-demo/raw/main/assets/demo.mp4

## 🌍 Live Demo (Temporary)

⚠️ This demo is exposed using **Cloudflare Tunnel (Quick Tunnel)**.  
The URL is **temporary** and works only while:
- Minikube is running  
- Cloudflare Tunnel process is active  

🔗 **Demo URL**  
https://bibliography-jungle-operation-myself.trycloudflare.com

---

## 🧱 Architecture

    Internet
       ↓
    Cloudflare Tunnel (HTTPS)
       ↓
    Local Machine
       ↓
    Minikube Service (NodePort)
       ↓
    Kubernetes Pods (Load Balanced)

---

## 🛠️ Tech Stack

- Node.js (Express)
- Docker
- Kubernetes (Minikube)
- Cloudflare Tunnel
- GitHub

---

## 🚀 How to run locally

### 1️⃣ Build Docker image

    cd app
    docker build -t lb-demo .

---

### 2️⃣ Start Minikube

    minikube start --driver=docker

---

### 3️⃣ Load image into Minikube

    minikube image load lb-demo

---

### 4️⃣ Deploy to Kubernetes

    kubectl apply -f k8s/

---

### 5️⃣ Scale pods

    kubectl scale deployment backend --replicas=5

---

### 6️⃣ Expose via Cloudflare Tunnel

Get the local service URL:

    minikube service backend-service --url

Expose it publicly:

    cloudflared tunnel --url http://127.0.0.1:<PORT>

---

## 🧪 Learning Outcomes

This project helps you understand:

- Why Kubernetes Services load balance at **Layer 4 (TCP)**
- Why traffic may stay on the same pod temporarily
- How scaling works **without changing application code**
- Real-world Kubernetes networking behavior

---

## 📌 Notes

- No cloud provider used  
- No credit card required  
- Public HTTPS exposure using Cloudflare Tunnel  
- Ideal for Kubernetes fundamentals, demos, and interviews  

---

