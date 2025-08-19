import * as Application from "expo-application";
import { Platform } from "react-native";
import { bufferToBase64URLString, utf8StringToBuffer } from "./utilities";

export function getConfig(opts?: CredentialCreationOptions) {
  if (!opts?.publicKey) return null;

  const textString = utf8StringToBuffer(
    JSON.stringify(opts.publicKey.challenge)
  ) as unknown as ArrayBuffer;

  const challenge = bufferToBase64URLString(textString);
  const bundleId = Application.applicationId?.split(".").reverse().join(".");

  const rp = {
    id: Platform.select({
      web: undefined,
      ios: bundleId,
      android: bundleId?.replaceAll("_", "-"),
    }),
    name: opts.publicKey.rp.name,
  } satisfies PublicKeyCredentialRpEntity;

  const user = {
    id: bufferToBase64URLString(
      utf8StringToBuffer(
        JSON.stringify(opts.publicKey.user.id)
      ) as unknown as ArrayBuffer
    ),
    displayName: opts.publicKey.user.displayName,
    name: opts.publicKey.user.name,
  } satisfies PublicKeyCredentialUserEntityJSON;

  const authenticatorSelection = {
    userVerification: "required",
    residentKey: "required",
  } satisfies AuthenticatorSelectionCriteria;

  return {
    challenge,
    rp,
    user,
    authenticatorSelection,
  };
}
