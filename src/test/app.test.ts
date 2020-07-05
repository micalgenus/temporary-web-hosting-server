import { assert } from 'chai';
import { postRequest, getRequest } from '@/test/utils/app';

describe('Express', () => {
  it('Run', async () => {
    const { status } = await postRequest('/ping');

    assert.equal(status, 200);
  });

  it('Upload text', async () => {
    const random = Math.random().toString();
    const path = Math.random().toString();
    const { status, body } = await postRequest('/upload/text', { body: { path: `/${path}`, text: random } });
    const { namespace } = body;

    assert.equal(status, 200);
    assert.isString(namespace);

    const { status: getStatus, text } = await getRequest(`/download/${namespace}/${path}`);

    assert.equal(getStatus, 200);
    assert.equal(text, random);
  });
});
