---
title: 'Deploying Prometheus & Grafana behind Nginx & Cloudflare'
date: 'Nov 1 2022'
tags: monitoring, cloudflare, metrics
---

Ever wondered how to check the status of your services, visualize CPU utilization and memory consumption when running high workloads or get alerted if the request counts looks abnormal? This is the space of observability and in this article we’re going to not only deploy a production-ready observability solution to the internet, but we will develop and deploy an application to put it to use.

We will setup Prometheus and Grafana with TLS support and basic authentication. These applications will be hosted on Hetzner behind Cloudflare using NGINX as our reverse proxy. We will break down the architecture, each of the components and understand alternatives that may fit well in your setup.

- Grafana provides the ability to create dashboards, charts and graphs to visualize your application data, getting alerts and much more.
- Prometheus is an all-in-one metrics orchestration tool that will scrape and store data from your applications. One can run ad-hoc queries via the Prometheus dashboard to visualize individual metrics and setup alerting rules via the Alerts Manager to notify us if certain pre-defined thresholds are hit.

Here is a look at the final dashboard we will see for our demo application in Grafana.

![Untitled](/images/Deploying%20Prometheus%20&%20Grafana%20Behind%20NGINX%20&%20Clou%20b689a59397c743c78a6265f828779357/Untitled.png)

I knew I had the following constraints:

- Access Prometheus and Grafana behind an NGINX reverse proxy
- Enable TLS for all routes to ensure communication is secure (Cloudflare provides cert generation for free via Let’s Encrypt).
- I wanted to back these behind my domain `ryan-schachte.com` using a sub-domain like `metrics.ryan-schachte.com` and `monitoring.ryan-schachte.com`

# Understanding the architecture

![Untitled](/images/Deploying%20Prometheus%20&%20Grafana%20Behind%20NGINX%20&%20Clou%20b689a59397c743c78a6265f828779357/Untitled%201.png)

Let’s break down the architecture in smaller chunks:

- DNS and security for the VPS is fronted by Cloudflare. Page rules are setup to redirect all HTTP (:80) non-encrypted traffic to HTTPS.  Cloudflare certificates generated via Let’s Encrypt make this possible. This redirection will ensure all traffic for my domain is redirected to port 443 to keep the network tunnel secure.
- NGINX is running on the metal directly and has configuration rules for Grafana, Prometheus, our app server and node exporter. We will perform TLS termination at the NGINX layer to avoid having to worry about TLS termination from within each application we manage. Because we are distributing traffic within the same machine over the same network interface, there is little risk sending data from NGINX to our application servers unencrypted.
- Requests that match the NGINX config will terminate and forward off to the containers we have running on the machine.
- The app servers will write metrics that have been added into the application alongside the app and be exposed on a `/metrics` endpoint that Prometheus will scrape. From here, we can start visualizing almost anything imaginable.

# Generating TLS certificates with Cloudflare

The first thing we need to do is create some TLS certificate(s) for our site. You can either segregate the certificates to match the subdomain directly or use a wildcard matcher to simplify the amount of certificates you need to manage. I started with the former and realized the latter is much easier for long-term management. 

In this case, I’m using Cloudflare, but you can easily utilize self-signed certificated via OpenSSL or just run Let’s Encrypt yourself if you don’t want to deal with Cloudflare as your third-party TLS manager. 

![Untitled](/images/Deploying%20Prometheus%20&%20Grafana%20Behind%20NGINX%20&%20Clou%20b689a59397c743c78a6265f828779357/Untitled%202.png)

In the above, we want to leverage the `Full` encryption for TLS. This will ensure that the communication from the client all the way to the origin (NGINX) is encrypted. In the case that you manage and control the origin server, `Full` is a great option. If you want TLS, but you cannot modify the TLS settings on the origin, then something like `Flexible` might be better. Flexible will allow you to maintain TLS with termination happening at the Cloudflare layer. The downside is the communication from Cloudflare to the origin would run over HTTP and exposes the application to MITM attacks.

Within your zone, let’s create a TLS certificate

![Untitled](/images/Deploying%20Prometheus%20&%20Grafana%20Behind%20NGINX%20&%20Clou%20b689a59397c743c78a6265f828779357/Untitled%203.png)

We want to specify a wildcard matcher to be a catch-all for all the subdomains we have. This keeps future TLS management simple. 

![Untitled](/images/Deploying%20Prometheus%20&%20Grafana%20Behind%20NGINX%20&%20Clou%20b689a59397c743c78a6265f828779357/Untitled%204.png)

From here, you’ll be able to grab the `key` (keep this private) and the `origin certificate` (this can be public). 

![Untitled](/images/Deploying%20Prometheus%20&%20Grafana%20Behind%20NGINX%20&%20Clou%20b689a59397c743c78a6265f828779357/Untitled%205.png)

Let’s save these files somewhere safe because they will become relevant as we continue deeper into this tutorial.

# Configuring Prometheus

Prometheus configuration will be done in 2 parts

- `Prometheus.yml`
    - This will allow us to specify custom things like the nodes we want to scrape metrics from
    - The scrape interval
    - Custom rules
    - Anything Prometheus configuration related [(see docs)](https://prometheus.io/docs/prometheus/latest/configuration/configuration/)
- `docker-compose.yaml`
    - Mounting the config files
    - Setting env variables
    - Configuring TLS certificates for TLS encryption

## Breaking down the Prometheus configuration

We’ll keep the configuration fairly vanilla, but explain each of the blocks:

```yaml
# Global Config
global:
  scrape_interval: 15s # Set the scrape interval to every 15 seconds. Default is every 1 minute.
  evaluation_interval: 15s # Evaluate rules every 15 seconds. The default is every 1 minute.

# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets:
          # - alertmanager:9093

# Load rules once and periodically evaluate them according to the global 'evaluation_interval'.
rule_files:
  # - "first_rules.yml"

scrape_configs:
  - job_name: "prometheus"
    static_configs:
      - targets: ["localhost:9090"]
        # Additionally, a certificate and a key file are needed.

  - job_name: "node"
    static_configs:
    - targets: ["node-exporter:9100"]
```

- **global**
    - The configuration in the global block will apply to all scrape configs. It’s not uncommon to specify the cadence of how often you want to pull metrics from your nodes denoted by `scrape_interval`.
    - The `evaluation_interval` specifies how often we evaluate rules as we modify our configuration.
- **alert manager**
    - The alert manager facilitates how we can emit alerts to services like Slack, Email and Pager Duty. Once thresholds are hit, the alert manager is pinged to perform the appropriate transformations for the services we’ve configured. The alert manager is typically a separate service that is running alongside Prometheus to handle these requests.
- **scrape configs**
    - This is a very important block. Each job specifies where and want we want to pull from, the node IP and port and any authentication or TLS requirements. In our case, everything will be running on the same node/network as Prometheus, so security will be kept to a minimum.
    - For professional grade applications, it will be important to look into the TLS configuration and auth requirements for scraping metrics that are more highly protected.

We will keep this file on the VPS and mount it via docker-compose so we can easily modify it as we add more nodes or adjust the configuration in the future. 

# Configuring Grafana

Grafana configuration will be done in 2 parts. Because we do TLS termination at the reverse proxy layer, configuration is actually pretty easy for Grafana. We will maintain a fairly vanilla setup for the purposes of this tutorial. 

- `grafana.ini`
    - This is the massive config file used to configure many components of Grafana
    - In this case, I’m using defaults, so it’s not 100% necessary to mount this file to the container.
- `docker-compose.yaml`
    - This is where we define volumes for data storage
    - (Optional) certificates if you don’t use reverse proxy for TLS termination
    - Various volume mounts, env variable setting, etc

# Configuring NGINX

NGINX is a big component of this architecture because it handles TLS termination for us. If you’re unfamiliar with TLS termination, the main idea is that the encrypted tunnel that enables encrypted communication between the client and server ends here. That means that any further data forwarded from NGINX to the application containers are unencrypted. 

As mentioned above, this is OK because the app server runs adjacent to NGINX on the same node, so opportunities for things like MITM (man-in-the-middle) attacks aren’t relevant. 

If you proxy data from NGINX to nodes outside the container, then you want to ensure you have firewalled and subnetted your services appropriately if you terminate at the reverse proxy layer. This VPC/subnet configuration is beyond the scope of this tutorial. If this is applicable to you and you want a simple config, look into `ufw` and whitelisting the IP of your NGINX reverse proxy appropriately on the app server nodes to prevent external access from unwanted parties.  

Let’s take a peek at the `nginx.conf` to override the defaults to better fit our application.

```conf
events {
  worker_connections  4096;  ## Default: 1024
}

http {
	map $http_upgrade $connection_upgrade {
	  default upgrade;
	  '' close;
	}

  upstream metrics {
    server localhost:3000;
  }

  upstream prom {
    server localhost:9090;
  }

 server {
   server_name grafana.ryan-schachte.com;
   listen              443 ssl;
    ssl_certificate     universal_cert.pem;
    ssl_certificate_key universal_key.pem;
	  ssl_protocols       TLSv1 TLSv1.1 TLSv1.2;
	  ssl_ciphers         HIGH:!aNULL:!MD5;

	  proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_set_header Host $http_host;

    location / {
      add_header Content-Security-Policy "script-src: 'unsafe-eval' 'unsafe-inline';";
      proxy_pass http://metrics;
    }
  }

  server {
    server_name prometheus.ryan-schachte.com;
    listen              443 ssl;
    ssl_certificate     universal_cert.pem;
    ssl_certificate_key universal_key.pem;
    ssl_protocols       TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    location / {
	    auth_basic           "Administrator’s Area";
	    auth_basic_user_file .htpasswd;
      proxy_pass http://prom;
    }
  }
}
```

- **events**
    - This is required for every config, but we will override the default number of worker connections to 4096.
- **http**
    - This will be the block we define our servers separately

As mentioned previously, NGINX will be our reverse proxy that also handles TLS termination. As a result, we will use the previously created TLS certificates from Cloudflare to handle that termination. This will allow us to visit our routes with the `https://` prefix and encrypt our traffic from the client to the origin. 

The rest is fairly self-explanatory, but it’s worth pointing out a few things:

- the `proxy_pass` directives will forward traffic to the appropriate Docker containers.
- `Prometheus` is backed by basic authentication. This is using a `.htpasswd` file to handle the users who are able to access the server. The passwords are generated using bcrypt.
- `htpasswd -b <file> <user>`

In newer versions of Grafana, a bug was introduced affecting Grafana servers behind a reverse proxy. To ensure this works correctly, it’s imperative to add the following line:

`proxy_set_header Host $http_host;`

# Setting up Docker Compose

My VPS has Docker-CE installed. I personally find, for homelabbing, that Docker is still great for me. I’ve deployed Kubernetes in the past and just find the overhead to be unnecessarily complicated for lightweight app server deployments. 

With Docker Compose, we can manage all the related services in a single file and deploy them. It’s in my to-do to automate these deployments from a Github Action or similar CI system, but we’ll keep it simple for this tutorial. 

```yaml
volumes:
  prometheus_data: {}
  grafana_storage: {}

services:
  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    restart: unless-stopped
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    ports:
      - "9100:9100"
    networks:
			- net

  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: unless-stopped
    volumes:
      - ./prom.yml:/etc/prometheus/prometheus.yml
      - ./universal_cert.pem:/etc/prometheus/cert.pem
      - ./universal_key.pem:/etc/prometheus/key.pem
      - ./web.yml:/etc/prometheus/web.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-lifecycle'
    ports:
      - "9090:9090"
    networks:
			- net

  grafana:
    image: grafana/grafana-enterprise
    container_name: grafana
    volumes:
      - grafana_storage:/var/lib/grafana
      - ./grafana.ini:/etc/grafana/grafana.ini
      - ./universal_cert.pem:/etc/grafana/cert.pem
      - ./universal_key.pem:/etc/grafana/key.pem
    restart: unless-stopped
    ports:
      - "3000:3000"
    networks:
			- net

networks:
  net: {}
```

We’ll discuss some key points here, but the file is self-explanatory for those familiar with docker-compose. 

- All services are on the same network. This allows for easy between-container communication. We can use the service name as the host when invoking network requests.
- Volumes are defined at the top. This allows us to persist data in case of container restarts, etc. to maintain users and settings on server reboots or shutdowns.
- `--web.enable-lifecycle` will allow us to make prometheus modifications without requiring an entire app server restart via HTTP POST.
- Not super relevant here since we use NGINX to perform TLS termination, but you can mount the TLS certificates if you want TLS at the application layer as well.

# Metrics instrumentation via Go application

Let’s take advantage of our new setup by collecting application metrics and having Prometheus scrape them. We will then visualize the data in Grafana. 

## Go application

Let’s create a new Go application. We will initialize using `go mod init github.com/schachte/prometheus-article`. From here we can add the libraries needed to instrument metrics.

I’m not going to reinvent the wheel here, so following the basic [https://prometheus.io/docs/guides/go-application/](https://prometheus.io/docs/guides/go-application/) guide will be great for getting the initial project set up.

*Install the required dependencies*

```bash
go get github.com/prometheus/client_golang/prometheus
go get github.com/prometheus/client_golang/prometheus/promauto
go get github.com/prometheus/client_golang/prometheus/promhttp
```

*main.go*

```go
package main

import (
	"net/http"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

// Run this infinitely to demonstrate metrics collection
// at a larger scale
func recordMetrics() {
	go func() {
		for {
			opsProcessed.Inc()
			time.Sleep(2 * time.Second)
		}
	}()
}

// This is the counter metric
var (
	opsProcessed = promauto.NewCounter(prometheus.CounterOpts{
		Name: "schachte_processed_ops_total",
		Help: "The total number of processed events",
	})
)

func main() {
	recordMetrics()

	// Host the metrics endpoint
	// This is what the main Prometheus server will scrape once we configure
	// a new scrape job in the Prometheus YAML
	http.Handle("/metrics", promhttp.Handler())
	http.ListenAndServe(":2112", nil)
}
```

Let’s explain this code a bit. The main function will kick off once we run the binary and we will host a metrics endpoint on port `2112` until the process is killed. We’ll handle the networking for this shortly. 

You’ll notice we invoke this infinite loop that emits a counter metric every 2 seconds. This is cool because we can use this metric to visualize rate of increase for our metric in Grafana.

We won’t go into detail as to how Prometheus works and what metrics are supported, but we can assume a counter metric is an ever increasing value. We can leverage this value to understand percentiles, rates of increase, etc. for particular time ranges and much more. 

## Prometheus configuration

Now that we have a new server, let’s better understand the configuration updates and networking to scrape these metrics and pull them into Prometheus. 

```yaml
# Global Config
global:
  scrape_interval: 15s # Set the scrape interval to every 15 seconds. Default is every 1 minute.
  evaluation_interval: 15s # Evaluate rules every 15 seconds. The default is every 1 minute.

# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets:
          # - alertmanager:9093

# Load rules once and periodically evaluate them according to the global 'evaluation_interval'.
rule_files:
  # - "first_rules.yml"

scrape_configs:
  - job_name: "prometheus"
    static_configs:
      - targets: ["localhost:9090"]
        # Additionally, a certificate and a key file are needed.

  - job_name: "node"
    static_configs:
    - targets: ["node-exporter:9100"]

  - job_name: "demo"
    static_configs:
    - targets: ["metrics-demo:2112"]
```

The addition to the `Prometheus.yaml` above is the new `metrics-demo` job. Let’s point out a couple of things:

- The application server we will deploy via Docker will be targeted via the service name. If this is located on a different node or IP, then you would replace `metrics-demo` with the IP address of the node.
- Additionally, we’ve exposed the port `2112` . We will assume that we will port forward 2112 to 2112 outside of the container to keep the port mapping easier to remember.

This is the beauty of Prometheus because this is all we need to do. Shortly, we will understand how to validate the correctness of this configuration via the Prometheus dashboard. 

## Dockerfile

Now that we created a simple binary to deploy, let’s Dockerize it. This will simplify how we can pull and deploy the code onto our VPS. 

```docker
FROM golang:1.18-bullseye

ENV GO111MODULE=on
ENV GOFLAGS=-mod=vendor

WORKDIR "/app"

COPY . ./
RUN go mod vendor
RUN go build -o metrics .

CMD ["./metrics"]
```

We’ll ensure we have Go present by using the Go Bullseye base image. From here, it’s just a matter of copying the files into the image we want to build, installing the dependencies and setting the default entry point. 

`docker build -t metrics-demo:latest .`

If you’re building this image on an M1 mac and running on a Linux AMD-based system, you will need to adjust the build parameters accordingly.

`docker buildx build --platform linux/amd64 -t metrics-demo:latest .`

We can then push this image to our public or private registry using something like 

```bash
docker login
docker push metrics-demo:latest
```

For my case, I will be using my own private Docker registry, but you are also open to use the public Docker registry for free. 

We can adjust our `docker-compose.yaml` file and verify we can hit the metrics

```yaml
...
metrics-demo:
    restart: always
    image: metrics-demo-amd:latest
    ports:
      - 2112:2112
```

Then run `curl localhost:2112` to see metrics output to stdout. Once you see this output 

```bash
....

# TYPE process_virtual_memory_max_bytes gauge
process_virtual_memory_max_bytes 1.8446744073709552e+19
# HELP promhttp_metric_handler_requests_in_flight Current number of scrapes being served.
# TYPE promhttp_metric_handler_requests_in_flight gauge
promhttp_metric_handler_requests_in_flight 1
# HELP promhttp_metric_handler_requests_total Total number of scrapes by HTTP status code.
# TYPE promhttp_metric_handler_requests_total counter
promhttp_metric_handler_requests_total{code="200"} 1
promhttp_metric_handler_requests_total{code="500"} 0
promhttp_metric_handler_requests_total{code="503"} 0
# HELP schachte_processed_ops_total The total number of processed events
# TYPE schachte_processed_ops_total counter
schachte_processed_ops_total 845

....
```

We can redeploy and verify the node is online via Prometheus:

![Untitled](/images/Deploying%20Prometheus%20&%20Grafana%20Behind%20NGINX%20&%20Clou%20b689a59397c743c78a6265f828779357/Untitled%206.png)

From here, let’s query the data in Prometheus to see our metric increasing. 

![Untitled](/images/Deploying%20Prometheus%20&%20Grafana%20Behind%20NGINX%20&%20Clou%20b689a59397c743c78a6265f828779357/Untitled%207.png)

Let’s check out the average rate of increase over the last 1 minute. This should match our code (1 every 2 seconds).

![Untitled](/images/Deploying%20Prometheus%20&%20Grafana%20Behind%20NGINX%20&%20Clou%20b689a59397c743c78a6265f828779357/Untitled%208.png)

`rate` will show us the average rate of increase per second of samples collected from the range vector(s) present in the timeseries data queried. 

For 1 minute we would have 4 samples if we scrape every 15 seconds (15 * 4 = 60 seconds). `rate` will average these totals together and give us the per second rate of increase. Multiplying the result by 60 gets us the per minute average. Since the metrics emit at a constant rate, we see a straight line around 30.

## Grafana dashboard creation

Let’s build the following:
- Server status
- Metrics graph for req/min
- Metrics graph for req/sec

The final dashboard will look like this

![Untitled](/images/Deploying%20Prometheus%20&%20Grafana%20Behind%20NGINX%20&%20Clou%20b689a59397c743c78a6265f828779357/Untitled%209.png)

### Adding Prometheus Data Source

We will add our Prometheus data source. In our case, we have already setup and deployed Prometheus behind our domain, so we can use the domain directly. Depending on your setup or if you're following along locally, you could also target `localhost` or the IP address of your node.

![Datasource](/images/Deploying%20Prometheus%20&%20Grafana%20Behind%20NGINX%20&%20Clou%20b689a59397c743c78a6265f828779357/datasource.png)

Take note that we have `Basic Auth Details` filled out. This is because we have auth in front of Prometheus via NGINX. From here, we can begin creating a new dashboard.

![Datasource](/images/Deploying%20Prometheus%20&%20Grafana%20Behind%20NGINX%20&%20Clou%20b689a59397c743c78a6265f828779357/newdashboard.png)

### System Uptime 

Let's start with understanding system uptime and visualizing when our node goes down. Prometheus provides a query to tell us if a node is up or down via the following: `up{}` you can get specific and ask what service is up or down and the query will return a `1` for online and `0` for offline (`up{instance="metrics-demo:2112", job="demo"}`).

So how we can leverage this to build a fancy uptime monitoring panel?

![Datasource](/images/Deploying%20Prometheus%20&%20Grafana%20Behind%20NGINX%20&%20Clou%20b689a59397c743c78a6265f828779357/total.png)

Because Prometheus is our data source, we can plug the `PromQL` directly into Grafana and see the translation directly.

![Datasource](/images/Deploying%20Prometheus%20&%20Grafana%20Behind%20NGINX%20&%20Clou%20b689a59397c743c78a6265f828779357/onlinedash.png)

You can get fancier and modify the value mappings in the side-panel to get textual mappings from number to English like so:

![Datasource](/images/Deploying%20Prometheus%20&%20Grafana%20Behind%20NGINX%20&%20Clou%20b689a59397c743c78a6265f828779357/valuemapping.png)

Next, let's look at the total request count over the last 24 hours.

![Datasource](/images/Deploying%20Prometheus%20&%20Grafana%20Behind%20NGINX%20&%20Clou%20b689a59397c743c78a6265f828779357/totalreqquery.png)

After choosing Prometheus as your data source, you can plug in the following query `increase(schachte_processed_ops_total[24h])` and understand the rate of increase over a 24 hour period. You can tweak some of the naming and coloring in the side-panel.

Be sure to check out the Prometheus docs to see what other cool metrics you can instrument and visualize!

# Summary

Prometheus and Grafana are awesome tools to have in your observability toolbelt. Not only is this used in the enterprise world, but it can also be used with hobby projects too. I've posted all the relevant code below. Be sure to leave a comment or email me if you have any questions!

# Relevant code