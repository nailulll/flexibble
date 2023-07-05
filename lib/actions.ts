import { ProjectForm } from "@/common.types";
import {
  createProjectMutation,
  createUserMutation,
  deleteProjectMutation,
  getProjectByIdQuery,
  getProjectsOfUserQuery,
  getUserQuery,
  projectsQuery,
  updateProjectMutation,
} from "@/graphql";
import { GraphQLClient } from "graphql-request";

const isProduction = process.env.NODE_ENV === "production";
const apiUrl = isProduction
  ? process.env.NEXT_PUBLIC_GRAFBASE_API_URL || ""
  : "http://127.0.0.1:4000/graphql";

const apiKey = isProduction
  ? process.env.NEXT_PUBLIC_GRAFBASE_API_KEY || ""
  : "";

const server = isProduction
  ? process.env.NEXT_PUBLIC_SERVER_URL
  : "http://localhost:3000";

const client = new GraphQLClient(apiUrl);

const makeGraphqlRequest = async (query: string, variable = {}) => {
  try {
    return await client.request(query, variable);
  } catch (error) {
    throw error;
  }
};

export const getUser = (email: string) => {
  client.setHeader("x-api-key", apiKey);
  return makeGraphqlRequest(getUserQuery, { email });
};

export const createUser = (name: string, email: string, avatarUrl: string) => {
  client.setHeader("x-api-key", apiKey);
  const variable = {
    input: {
      name,
      email,
      avatarUrl,
    },
  };
  return makeGraphqlRequest(createUserMutation, variable);
};

export const uploadImage = async (imagePath: string) => {
  try {
    const response = await fetch(`${server}/api/upload`, {
      method: "POST",
      body: JSON.stringify({ path: imagePath }),
    });
    const data = await response.json();

    return data;
  } catch (error) {
    throw error;
  }
};

export const createNewProject = async (
  form: ProjectForm,
  creatorId: string,
  token: string
) => {
  const imageUrl = await uploadImage(form.image);

  if (imageUrl.url) {
    client.setHeader("Authorization", `Bearer ${token}`);

    const variables = {
      input: {
        ...form,
        image: imageUrl.url,
        createdBy: {
          link: creatorId,
        },
      },
    };

    return makeGraphqlRequest(createProjectMutation, variables);
  }
};

export const updateProject = async (
  form: ProjectForm,
  projectId: string,
  token: string
) => {
  function isBase64DataURL(value: string) {
    const base64Regex = /^data:image\/[a-z]+;base64,/;
    return base64Regex.test(value);
  }

  let updatedForm = { ...form };

  const isUploadingNewImage = isBase64DataURL(form.image);

  if (isUploadingNewImage) {
    const imageUrl = await uploadImage(form.image);

    if (imageUrl.url) {
      updatedForm = { ...updatedForm, image: imageUrl.url };
    }
  }

  client.setHeader("Authorization", `Bearer ${token}`);

  const variables = {
    id: projectId,
    input: updatedForm,
  };

  return makeGraphqlRequest(updateProjectMutation, variables);
};

export const fetchToken = async () => {
  try {
    const response = await fetch(`${server}/api/auth/token`);
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const fetchAllProject = async (
  category?: string,
  endCursor?: string
) => {
  client.setHeader("x-api-key", apiKey);
  return makeGraphqlRequest(projectsQuery, { category, endCursor });
};

export const getProjectDetail = async (id: string) => {
  client.setHeader("x-api-key", apiKey);
  return makeGraphqlRequest(getProjectByIdQuery, { id });
};

export const getUserProject = async (id: string, last?: number) => {
  client.setHeader("x-api-key", apiKey);
  return makeGraphqlRequest(getProjectsOfUserQuery, { id, last });
};

export const deleteProject = (id: string, token: string) => {
  client.setHeader("Authorization", `Bearer ${token}`);
  return makeGraphqlRequest(deleteProjectMutation, { id });
};

export const getProjectDetails = (id: string) => {
  client.setHeader("x-api-key", apiKey);
  return makeGraphqlRequest(getProjectByIdQuery, { id });
};
