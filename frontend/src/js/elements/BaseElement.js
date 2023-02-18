export default class BaseElement extends HTMLElement {
  constructor(constructorProps) {
    super();

    this.props = constructorProps || this.getAttributesProps();
    this.init(this.props);
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
