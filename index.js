const axios = require('axios');
const fs = require('fs-extra');
const FormData = require('form-data');

class AiTransactions {
    constructor(endpointUrl, apiKey) {
      this.endpointUrl = endpointUrl;
      this.apiKey = apiKey; 
      axios.defaults.headers.common['Content-Type'] = 'application/json';
      axios.defaults.headers.common['Ocp-Apim-Subscription-Key'] = apiKey;
    }
  
    async createTransaction({ serviceId, studyUid, accessionNumber }) {
      const payload = {
        service: {
          id: serviceId
        },
        accessionNumber,
        studyUID: studyUid,
        priority: 1,
        status: 'ANALYSIS_PENDING'
      };

      try {
        const { data } = await axios.post(this.endpoint_url, payload);
        return {
          serviceId,
          transactionId: data.id,
        };
      } catch(err) {
        console.error(err);
        throw err;
      }
    }

    async updateTransaction(transactionId, payload) {
      let url = `${this.endpointUrl}/${transactionId}`;
      try {
          const resp = await axios.put(url, payload);
          if (resp.status === 200) {
              return resp.data;
          } else {
              throw Error('Update failed');
          }
      } catch (err) {
          console.error(err);
          throw err;
      }
    }

    async markTransactionStatusComplete(transactionId) {
      await this.updateTransaction(transactionId, { status: 'ANALYSIS_COMPLETE' });
    }
 
    async findTransaction (query) {
        // TODO
    }

    async createResult (transactionId, serviceKey, resultKey, resultType) {
      const url = `${this.endpointUrl}/${transactionId}/results`;
      const body = {
        serviceKey,
        resultKey,
        resultType,
      };
      try {
        const response = await axios.post(url, body);
        const resultId = response.data.id;
        return resultId;
      } catch (err) {
        console.log(err);
        throw err;
      }
    }
   
    async uploadResultFiles (transactionId, resultId, filenames) {
      const url = `${this.endpointUrl}/${transactionId}/results/${resultId}/documents`
      filenames.forEach(async filename => {
        const form = new FormData();
        form.append('documentType', 'json');
        form.append('name', 'AI result');
        form.append('file', fs.createReadStream(filename));

        const headers = Object.assign({
          'content-type': 'multipart/form-data',
          'Accept': 'application/json',
          'Ocp-Apim-Subscription-Key': this.apiKey
        }, form.getHeaders());
        try {
          await axios.post(url, form, { headers });
        } catch (err) {
          console.log(err);
          throw err;
        }
      });
    }

    async uploadResultData (transactionId, resultId, data) {
      fs.writeFileSync('result.json', data, 'utf8');
      await this.uploadResultFiles(transactionId, resultId, ['result.json']);  
      fs.unlinkSync('result.json');
    }
}
  
module.exports = AiTransactions;