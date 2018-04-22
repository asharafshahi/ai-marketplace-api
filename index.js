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
        serviceId, accessionNumber,
        studyUID: studyUid,
        priority: 1,
        status: 'initiated'
      }
      return new Promise(async (resolve, reject) => {
        try {
           const { data } = await axios.post(this.endpoint_url, payload);
           resolve({
             serviceId,
             transactionId: data.transactionId,
           });
        } catch(err) {
          console.error(err.message);
          reject(err)
        }
      });
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
 
    async findTransaction (query) {
        // TODO
    }

    async uploadResult (transactionId, serviceKey, resultKey, data) {
        let url = `${this.endpointUrl}/${transactionId}/results`;
        const body = {
          serviceKey,
          resultKey: 'test'
        };
        const response = await axios.post(url, body);
        const resultId = response.data.result.id;
        url = `${url}/${resultId}/documents`;
        const config = {
          headers: {
            'content-type': 'multipart/form-data'
          }
        };
        fs.writeFileSync('result.json', data, 'utf8');
        const form = new FormData();
        form.append('documentType', 'json');
        form.append('name', 'AI result');
        form.append('file', fs.createReadStream('result.json'));
        console.log(url);
        form.submit(url, (err, res) => {
          if (!err) console.log('submission success');
          fs.unlinkSync('result.json');
        });
      };
  }
  
  module.exports = AiTransactions;