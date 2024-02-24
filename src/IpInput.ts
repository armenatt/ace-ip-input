import { removeNaNCharacters, removeProtocol } from "./helpers";
import { IpInputType } from "./types";

export type TIpInputObject = {
  octet1: string;
  octet2: string;
  octet3: string;
  octet4: string;
};

export interface TIpInputObjectRest extends TIpInputObject {
  mask?: string;
  port?: string;
}

export class IpInput {
  public type: IpInputType;
  private input: TIpInputObject | string;
  private separator: string;
  private octets: TIpInputObject;
  private rest: string | undefined;

  constructor(
    input: TIpInputObjectRest | string,
    type = IpInputType.IpAddress
  ) {
    this.input = input;
    this.type = type;
    this.octets = {
      octet1: "",
      octet2: "",
      octet3: "",
      octet4: "",
    };
    this.rest = "";
    this.separator = "";

    if (this.type === IpInputType.Mask) {
      this.separator = "/";
    }

    if (this.type === IpInputType.Port) {
      this.separator = ":";
    }

    if (typeof this.input === "string") {
      this.breakString(this.input);
    }

    if (typeof this.input === "object") {
      this.handleObject(
        this.validateIpObject(this.input as TIpInputObjectRest)
      );
    }
  }

  public getObject() {
    if (this.type === IpInputType.Mask) {
      return {
        ...this.octets,
        mask: this.rest,
      };
    }

    if (this.type === IpInputType.Port) {
      return {
        ...this.octets,
        port: this.rest,
      };
    }

    return this.octets;
  }

  public getString() {
    const octets = Object.values(this.octets);

    const ipString = octets.join(".");

    if (this.rest) {
      return `${ipString}${this.separator}${this.rest}`;
    }

    if (ipString === "...") {
      return "";
    }

    return ipString;
  }

  private breakString(value: string): void {
    const regex = /[^a-zA-Z0-9 ]/g;

    if (!value) {
      return;
    }

    value = removeProtocol(value);
    let ipString: string = "",
      restString: string = "";

    if (!this.separator) {
      ipString = value;

      if (ipString.includes("/")) {
        ipString = ipString.split("/")[0];
      }

      if (ipString.includes(":")) {
        ipString = ipString.split(":")[0];
      }
    }

    if (this.separator) {
      let [ip, rest] = value.split(this.separator);
      ipString = ip;
      restString = rest;
    }

    let ipDraft = ipString.split(".", 4);

    ipDraft = ipDraft.map((octet) => {
      return octet.replace(regex, "");
    });

    this.octets.octet1 = ipDraft[0] || "";
    this.octets.octet2 = ipDraft[1] || "";
    this.octets.octet3 = ipDraft[2] || "";
    this.octets.octet4 = ipDraft[3] || "";

    if (this.type !== IpInputType.IpAddress && value.includes(this.separator)) {
      this.rest = restString;
    }
  }

  private handleObject(value: TIpInputObjectRest) {
    this.octets.octet1 = value.octet1 || "";
    this.octets.octet2 = value.octet2 || "";
    this.octets.octet3 = value.octet3 || "";
    this.octets.octet4 = value.octet4 || "";

    if (value.mask || value.port) {
      this.rest = value.mask || value.port;
    }
  }

  private validateIpObject(value: TIpInputObjectRest): TIpInputObjectRest {
    Object.keys(value).forEach((key) => {
      value[key] = removeNaNCharacters(value[key]);

      if (key.includes("octet")) {
        if (Number(value[key]) > 255) {
          value[key] = 255;
        }
      }

      if (key === "mask") {
        if (Number(value[key]) > 32) {
          value[key] = "32";
        }
      }

      if (key === "port") {
        if (Number(value[key]) > 65535) {
          value[key] = "65535";
        }
      }
    });

    return value;
  }
}
