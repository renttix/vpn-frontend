declare module 'fast-xml-parser' {
  export class XMLParser {
    constructor(options?: {
      ignoreAttributes?: boolean;
      attributeNamePrefix?: string;
      allowBooleanAttributes?: boolean;
      parseAttributeValue?: boolean;
      parseNodeValue?: boolean;
      trimValues?: boolean;
      cdataTagName?: string;
      cdataPositionChar?: string;
      localeRange?: string;
      parseTrueNumberOnly?: boolean;
      arrayMode?: boolean | ((tagName: string) => boolean);
      attrValueProcessor?: (value: string, attrName: string) => string;
      tagValueProcessor?: (value: string, tagName: string) => string;
      stopNodes?: string[];
      isArray?: (tagName: string, jPath: string, isLeafNode: boolean, isAttribute: boolean) => boolean;
    });
    parse(xmlData: string): any;
  }

  export class XMLBuilder {
    constructor(options?: {
      attributeNamePrefix?: string;
      attrNodeName?: string;
      textNodeName?: string;
      ignoreAttributes?: boolean;
      cdataTagName?: string;
      cdataPositionChar?: string;
      format?: boolean;
      indentBy?: string;
      supressEmptyNode?: boolean;
      tagValueProcessor?: (value: string) => string;
      attrValueProcessor?: (value: string) => string;
    });
    build(jObj: any): string;
  }

  export function parse(xmlData: string, options?: any): any;
  export function validate(xmlData: string): boolean | { err: { code: string, msg: string, line: number } };
  export function convertToBinary(xmlData: string): Uint8Array;
}
