import vscode from 'vscode';

import ReferenceProvider from './ReferenceProvider';
import {
  createFile,
  rndName,
  openTextDocument,
  closeEditorsAndCleanWorkspace,
  toPlainObject,
} from '../test/testUtils';

describe('ReferenceProvider', () => {
  beforeEach(closeEditorsAndCleanWorkspace);

  afterEach(closeEditorsAndCleanWorkspace);

  it('should provide references', async () => {
    const note0 = rndName();
    const note1 = rndName();

    await createFile(`${note0}.md`, `[[${note0}]]`);
    await createFile(`${note1}.md`, `[[${note0}]]`);

    const doc = await openTextDocument(`${note1}.md`);

    const referenceProvider = new ReferenceProvider();

    const links = await referenceProvider.provideReferences(doc, new vscode.Position(0, 2));

    expect(toPlainObject(links)).toMatchObject([
      {
        range: [
          {
            character: expect.any(Number),
            line: 0,
          },
          {
            character: expect.any(Number),
            line: 0,
          },
        ],
        uri: {
          path: expect.stringContaining(`${note0}.md`),
          scheme: 'file',
        },
      },
    ]);
  });

  it('should provide no references for link within code span', async () => {
    const note0 = rndName();
    const note1 = rndName();

    await createFile(`${note0}.md`, `[[${note0}]]`);
    await createFile(`${note1}.md`, `\`[[${note0}]]\``);

    const doc = await openTextDocument(`${note1}.md`);

    const referenceProvider = new ReferenceProvider();

    const links = await referenceProvider.provideReferences(doc, new vscode.Position(0, 2));

    expect(links).toHaveLength(0);
  });

  it('should provide no references for link within fenced code block', async () => {
    const note0 = rndName();
    const note1 = rndName();

    await createFile(`${note0}.md`, `[[${note0}]]`);
    await createFile(
      `${note1}.md`,
      `
    \`\`\`
    Preceding text
    [[${note0}]]
    Following text
    \`\`\`
    `,
    );

    const doc = await openTextDocument(`${note1}.md`);

    const referenceProvider = new ReferenceProvider();

    const links = await referenceProvider.provideReferences(doc, new vscode.Position(3, 6));

    expect(links).toHaveLength(0);
  });
});
