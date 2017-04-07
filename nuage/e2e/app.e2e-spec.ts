import { NuagePage } from './app.po';

describe('nuage App', () => {
  let page: NuagePage;

  beforeEach(() => {
    page = new NuagePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
