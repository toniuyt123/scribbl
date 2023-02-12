export default class BaseElement extends HTMLElement {
  constructor(constructorProps) {
    super();
    const attributeNames = this.getAttributeNames();
    const attributeProps = {};
    for (const attributeName of attributeNames) {
      attributeProps[attributeName] = this.getAttribute(attributeName);
    }
    this.init(constructorProps || attributeProps);
  }

  init(props) {
    throw new Error("init() not implemented");
  }
}
