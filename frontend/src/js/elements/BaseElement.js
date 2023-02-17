export default class BaseElement extends HTMLElement {
  constructor(constructorProps) {
    super();

    this.init(constructorProps || this.getAttributesProps());
  }

  getAttributesProps() {
    const attributeNames = this.getAttributeNames();
    const attributeProps = {};
    for (const attributeName of attributeNames) {
      attributeProps[attributeName] = this.getAttribute(attributeName);
    }

    return attributeProps;
  }

  init(props) {
    throw new Error("init() not implemented");
  }
}
