interface ErrorDetail {
  domain: string;
  location: string;
  locationType: string;
  message: string;
  reason: string;
}

interface Error {
  code: number;
  message: string;
  status: string;
  errors: ErrorDetail[];
}

interface GapiError {
  error: Error;
}

export function createFolder(
  metadata: gapi.client.drive.File,
  fields?: string[]
) {
  return gapi.client.drive.files.create({
    fields: fields?.join(","),
    resource: {
      mimeType: "application/vnd.google-apps.folder",
      ...metadata,
    },
  });
}

export function createLink(
  linkTo: gapi.client.drive.File,
  fileDest: gapi.client.drive.File,
  fields?: string[]
) {
  return gapi.client.drive.files.create({
    fields: fields?.join(","),
    resource: {
      mimeType: "application/vnd.google-apps.shortcut",
      shortcutDetails: {
        targetId: linkTo.id,
        targetMimeType: linkTo.mimeType,
      },
      ...fileDest,
    },
  });
}

export function createFile(
  metadata: gapi.client.drive.File,
  body: string
): Promise<gapi.client.drive.File | GapiError> {
  const boundary = "-------314159265358979323846";
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

  const contentType = metadata.mimeType ?? "text/plain";

  const multipartRequestBody =
    delimiter +
    "Content-Type: application/json\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    "Content-Type: " +
    contentType +
    "\r\n\r\n" +
    body +
    close_delim;

  const request = gapi.client.request({
    path: "/upload/drive/v3/files",
    method: "POST",
    params: { uploadType: "multipart" },
    headers: {
      "Content-Type": 'multipart/related; boundary="' + boundary + '"',
    },
    body: multipartRequestBody,
  });

  return new Promise((resolve) => {
    request.execute((resp) =>
      resolve(resp as gapi.client.drive.File | GapiError)
    );
  });
}

export function createBinaryFile(
  metadata: gapi.client.drive.File,
  body: Blob
): Promise<gapi.client.drive.File | GapiError> {
  const boundary = "-------314159265358979323846";
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

  const contentType = metadata.mimeType ?? "text/plain";

  const multipartRequestBody =
    delimiter +
    "Content-Type: application/json\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    "Content-Type: " +
    contentType +
    "\r\n\r\n" +
    body +
    close_delim;

  const request = gapi.client.request({
    path: "/upload/drive/v3/files",
    method: "POST",
    params: { uploadType: "multipart" },
    headers: {
      "Content-Type": 'multipart/related; boundary="' + boundary + '"',
    },
    body: multipartRequestBody,
  });

  return new Promise((resolve) => {
    request.execute((resp) =>
      resolve(resp as gapi.client.drive.File | GapiError)
    );
  });
}

export function updateFileContent(
  fileId: string,
  body: string,
  contentType: string = "text/plain"
): Promise<gapi.client.drive.File | GapiError> {
  const request = gapi.client.request({
    path: `/upload/drive/v3/files/${fileId}`,
    method: "PATCH",
    params: { uploadType: "media" },
    headers: {
      "Content-Type": contentType,
    },
    body,
  });
  return new Promise((resolve) => {
    request.execute((resp) =>
      resolve(resp as gapi.client.drive.File | GapiError)
    );
  });
}

export async function updateFileMetadata(
  id: string,
  metadata: gapi.client.drive.File,
  fields?: string[]
) {
  return gapi.client.drive.files.update({
    fileId: id,
    resource: metadata,
    fields: fields?.join(","),
  });
}

export function setPermissionToAnyoneCanRead(fileId: string) {
  return gapi.client.drive.permissions.create({
    fileId,
    resource: {
      role: "reader",
      type: "anyone",
    },
  });
}

export async function deleteFile(id: string) {
  return await gapi.client.drive.files.delete({
    fileId: id,
  });
}

export async function deleteAllFilesByNameAtFolder(
  name: string,
  parentId: string
) {
  try {
    const res = await gapi.client.drive.files.list({
      fields: "files(id)",
      pageSize: 10,
      q: `name = '${name}' and '${parentId}' in parents`,
      spaces: "drive",
    });
    if (res.status !== 200) return { error: true, result: res };
    if (res.result.files!.length === 0) return { error: false, result: res };
    const res2 = await Promise.all(
      res.result.files!.map((f) => deleteFile(f.id as string))
    );
    return { error: res2.every((f) => f.status === 204), result: res2 };
  } catch (e) {
    return { error: true, result: e };
  }
}

export async function copyFile(
  fromFileId: string,
  toFolderId: string,
  fields?: string[]
) {
  return await gapi.client.drive.files.copy({
    fileId: fromFileId,
    fields: fields?.join(","),
    resource: {
      parents: [toFolderId],
    },
  });
}
