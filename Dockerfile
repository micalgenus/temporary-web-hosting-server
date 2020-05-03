FROM node:12 as builder

COPY ./ /root/hosting
WORKDIR /root/hosting

RUN yarn && yarn build

## Server
FROM node:12-alpine

COPY --from=builder /root/hosting/dist /home/hosting/dist
COPY --from=builder /root/hosting/package.json /home/hosting
WORKDIR /home/hosting

RUN yarn --production

EXPOSE 3000

STOPSIGNAL SIGINT

ENTRYPOINT yarn start