#!/bin/bash

# assumes these are set by the caller
[ -z $GCP_PROJECT ] && echo GCP_PROJECT must be defined && exit
[ -z $GCP_REGION ] && echo GCP_REGION must be defined && exit
[ -z $IMAGE ] && echo IMAGE must be defined && exit
[ -z $IMAGE_AND_TAG ] && echo IMAGE_AND_TAG must be defined && exit

gcloud run deploy $IMAGE \
--image=gcr.io/$GCP_PROJECT/$IMAGE_AND_TAG \
--allow-unauthenticated \
--port=80 \
--min-instances=10 \
--max-instances=10 \
--no-use-http2 \
--cpu-throttling \
--platform=managed \
--region=$GCP_REGION \
--project=$GCP_PROJECT \
--vpc-connector wsc-vpc-connector-1 \
--set-env-vars "REDIS_IP=10.80.67.227,REDIS_SECRET=wOlVsEc_sEcR3T_f0r_ch@@l_auT0rA1d3r"
