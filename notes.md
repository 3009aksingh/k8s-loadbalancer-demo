# Kubernetes Notes — Load Balancer Demo Project

This document captures everything learned **from scratch about Kubernetes** while building the Load Balancer Demo project.

The goal of this project was to understand Kubernetes **practically**, by observing real behavior instead of only reading theory.

---

## 1. Why Kubernetes was needed

Problems without Kubernetes:

- Running a single container does not scale easily
- No automatic restart if a container crashes
- No built-in load balancing
- No declarative way to define desired state

What Kubernetes provides:

- Declarative configuration
- Automatic pod recovery
- Native service discovery
- Built-in load balancing
- Easy horizontal scaling

Key idea:
Kubernetes acts as a **control system** that continuously tries to match actual state with desired state.

---

## 2. Core Kubernetes components used in this project

### 2.1 Pod

- Smallest deployable unit in Kubernetes
- Wraps one or more containers
- Each pod has:
  - Its own IP
  - Its own hostname
- Pods are **ephemeral**
  - They can be destroyed and recreated anytime
  - They should never be treated as permanent servers

In this project:
- Each pod ran the same backend container
- Pod hostname was displayed to identify which pod served a request

Key takeaway:
Pods are disposable and replaceable.

---

### 2.2 Deployment

Purpose:
- Manages the lifecycle of pods
- Ensures the desired number of pods are always running

What a Deployment does internally:
- Creates a ReplicaSet
- ReplicaSet creates Pods
- Monitors pod health
- Recreates pods if they fail

In this project:
- Deployment defined:
  - Docker image
  - Container port
  - Number of replicas

Scaling example:

    kubectl scale deployment backend --replicas=5

Key takeaway:
You never manage pods directly — you manage Deployments.

---

### 2.3 ReplicaSet

- Automatically created by Deployment
- Ensures the correct number of pod replicas
- Rarely managed manually

Observed behavior:
- When a pod was deleted, a new one was created automatically

Key takeaway:
ReplicaSet enforces quantity, Deployment enforces intent.

---

### 2.4 Service

Problem it solves:
- Pods get new IPs when recreated
- Clients cannot reliably connect to pods directly

Service provides:
- Stable virtual IP
- Stable DNS name
- Load balancing across pods

In this project:
- Service selected pods using labels:

    app=backend

- Traffic was routed to any healthy pod matching the selector

Key takeaway:
Service is the networking abstraction between clients and pods.

---

## 3. How Kubernetes load balancing works

Observation from the demo:
- Pod name did not change on every browser refresh
- Traffic stayed on the same pod for some time

Reason:
- Kubernetes Service works at **Layer 4 (TCP)**
- Load balancing happens per TCP connection
- Browsers reuse TCP connections using keep-alive

Implication:
- Multiple HTTP requests over the same TCP connection go to the same pod
- New TCP connections may reach different pods

Key takeaway:
Kubernetes Services are L4 load balancers, not L7.

---

## 4. Pod readiness and traffic routing

Observed behavior:
- Pods in `ContainerCreating` state did not receive traffic
- Only pods in `READY 1/1` state were used

Reason:
- Kubernetes routes traffic only to **Ready** pods
- Unready pods are excluded automatically

Key takeaway:
Kubernetes protects users from half-started applications.

---

## 5. Scaling behavior

When scaling from 1 to 5 pods:

- New pods were created gradually
- Service automatically routed traffic to new pods
- No changes were required in application code
- No changes were required in Service configuration

Important:
- Docker image remained the same
- Application code remained the same

Key takeaway:
Scaling is an infrastructure concern, not an application concern.

---

## 6. Image management lesson (Minikube specific)

Problem faced:
- Pods stuck in `ImagePullBackOff`

Root cause:
- Docker image existed on local machine
- Minikube runs its own Docker environment
- Kubernetes could not access the image

Fix:

    minikube image load lb-demo

Key takeaway:
Kubernetes nodes must be able to access the container image.

---

## 7. Declarative vs imperative approach

Imperative approach (what we avoided):
- Manually starting containers
- Manually restarting failed processes
- Manually managing IPs

Declarative approach (Kubernetes way):
- Define desired state in YAML
- Kubernetes continuously reconciles actual state to desired state

Example:

    replicas: 5

Key takeaway:
In Kubernetes, you describe what you want, not how to do it.

---

## 8. Debugging Kubernetes (practical workflow)

Common commands used:

    kubectl get pods
    kubectl describe pod <pod-name>
    kubectl get deployment
    kubectl describe deployment backend
    kubectl get svc
    kubectl describe svc backend-service

What mattered most during debugging:
- Pod status
- Events section
- Service endpoints

Key takeaway:
Kubernetes debugging is mostly about observing state.

---

## 9. Final mental model built from this project

Simplified flow:

    Deployment
       ↓
    ReplicaSet
       ↓
    Pods
       ↓
    Service
       ↓
    Client

Each layer has a single responsibility.

---

---

## Hand-Drawn Style Diagrams (Conceptual)

These diagrams are intentionally simple and rough, like something you’d draw on a whiteboard while explaining Kubernetes to someone.

---

### 1. High-level Kubernetes flow (this project)

    User / Browser
          |
          v
    +----------------+
    |   Service      |   ← stable IP / DNS
    | (Load Balancer)|
    +----------------+
          |
    -------------------------
    |           |           |
    v           v           v
  Pod A       Pod B       Pod C
 (backend)  (backend)  (backend)

Key idea:
- User never talks to Pods directly
- Service decides which Pod gets traffic

---

### 2. Deployment → ReplicaSet → Pods relationship

    +------------------+
    |   Deployment     |
    |  (desired state) |
    |  replicas = 5    |
    +------------------+
              |
              v
        +-------------+
        | ReplicaSet  |
        |  (enforcer) |
        +-------------+
          |   |   |   |
          v   v   v   v
        Pod Pod Pod Pod Pod

Key idea:
- Deployment describes intent
- ReplicaSet enforces count
- Pods are replaceable workers

---

### 3. What happens when a Pod dies

    Before failure:

        Pod A   Pod B   Pod C
          ✓       ✓       ✓

    Pod B crashes ❌

    ReplicaSet notices:
        desired = 3
        actual  = 2

    After reconciliation:

        Pod A   Pod C   Pod D
          ✓       ✓       ✓

Key idea:
- No human intervention
- Kubernetes self-heals automatically

---

### 4. Why Pod IPs are NOT reliable

    Pod lifecycle:

        Pod X (IP: 10.0.0.12)
             |
           dies ❌
             |
        Pod Y (IP: 10.0.0.47)

Problem:
- IP changed
- Clients break if they talk directly

Solution:
- Always talk to Service
- Never talk to Pods directly

---

### 5. Service label-based routing

    Service selector:
        app = backend

    Pods:
        Pod A → app=backend  ✓
        Pod B → app=backend  ✓
        Pod C → app=frontend ✗

    Traffic goes only to:
        Pod A, Pod B

Key idea:
- Services don’t know pod names
- They only care about labels

---

### 6. Load balancing is per TCP connection (important)

    Browser
      |
      |  (TCP connection #1)
      v
    Service
      |
      v
    Pod A  ← multiple HTTP requests

    New TCP connection
      |
      v
    Service
      |
      v
    Pod C

Key idea:
- Same connection → same pod
- New connection → possibly new pod
- Explains “sticky” behavior during refresh

---

### 7. Readiness gates traffic

    Pod states:

        Pod A  READY ✓
        Pod B  READY ✓
        Pod C  STARTING ✗

    Service routes traffic only to:

        Pod A, Pod B

Key idea:
- Kubernetes protects users
- Unready pods never receive traffic

---

### 8. Scaling without touching application code

    Before scaling:

        replicas = 1
        [ Pod A ]

    After scaling:

        replicas = 5
        [ Pod A | Pod B | Pod C | Pod D | Pod E ]

    Application code:
        unchanged
    Docker image:
        unchanged
    Service config:
        unchanged

Key idea:
- Scaling is infrastructure-level
- Application stays simple

---

### 9. Minikube image problem (learning moment)

    Your Laptop Docker:
        lb-demo image ✓

    Minikube Docker:
        lb-demo image ✗

    Result:
        Pod → ImagePullBackOff

    Fix:

        minikube image load lb-demo

Key idea:
- Kubernetes nodes must see the image
- Local Docker ≠ Cluster Docker

---

### 10. One-page mental summary

    Desired State (YAML)
            |
            v
      Deployment
            |
            v
      ReplicaSet
            |
            v
          Pods
            |
            v
         Service
            |
            v
          Users

Key idea:
- Each layer has a single responsibility
- Kubernetes continuously reconciles state

---


## 10. Overall learnings

- Pods are temporary
- Deployments manage lifecycle
- ReplicaSets ensure replica count
- Services provide stable networking
- Load balancing is connection-based
- Scaling is simple once architecture is correct
- Kubernetes is predictable once fundamentals are clear

---

## Final takeaway

This project shows that Kubernetes is not magic.

It is:
- A reconciliation engine
- A declarative control system
- A platform for reliable scaling and recovery

Understanding this small project builds a strong foundation for more advanced topics like Ingress, auto-scaling, and production deployments.


