## Configuration

The following table lists the configurable parameters of the ETF chart and their default values.

| Parameter                         | Description | Default           |
| --------------------------------- | ----------- | ----------------- |
| backend.deployment.replicas       |             | `1`               |
| backend.mysql.config.db           |             | `etf`             |
| backend.mysql.config.user         |             | `etf`             |
| backend.mysql.config.password     |             | `password`        |
| backend.mysql.config.rootPassword |             | `rootPassword`    |
| backend.ingress.enabled           |             | false             |
| backend.ingress.annotations       |             | `[]`              |
| backend.ingress.host              |             | `backend.etf.com` |
| backend.ingress.tls.enabled       |             | false             |
