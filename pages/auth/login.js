import axios from "axios";
import React from "react";
import { useCsrf } from "@/lib/csrf";

function Login(props) {
  console.log(props);
  async function submitForm(e) {
    e.preventDefault();
    try {
      const result = await axios.post(
        "/api/auth/login",
        {
          email: e.target.email.value,
          password: e.target.password.value,
          _csrf: props?.data,
        },
        {
          withCredentials: true,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "xsrf-token": props?.csrf,
          },
        }
      );
      console.log(result.data);
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div>
      <form
        onSubmit={(e) => {
          submitForm(e);
        }}
      >
        <input name="email"></input>
        <br />
        <input name="password"></input>
        <br />
        <input type="hidden" name="_csrf" value={props.csrf} />

        <input type="submit"></input>
      </form>
    </div>
  );
}

export default Login;

export const getServerSideProps = async ({ req, res }) => {
  const result = await axios.get(
    `${req.headers["x-forwarded-proto"]}://${req.headers.host}/api/auth/login`,
    {
      withCredentials: true,
      headers: {
        Cookie: req.headers.cookie,
      },
    }
  );
  // console.log(result.data, req.headers["x-forwarded-proto"]);
//   console.log(res);
  return {
    props: {
      data: result?.data.csrf,
      all:result?.data?.session,
      csrf: req.headers.cookie?.split(";")[1]?.split("=")[1] || {},
    },
  };
};
