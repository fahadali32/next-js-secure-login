import axios from "axios";
import React from "react";
import { useCsrf } from "@/lib/csrf";
import { getCookie } from "cookies-next";

function Register(props) {
  console.log(props);
  async function submitForm(e) {
    e.preventDefault();
    try {
      const result = await axios.post(
        "/api/auth/register",
        {
          username: e.target.username.value,
          password: e.target.password.value,
          firstname: e.target.firstname.value,
          lastname: e.target.lastname.value,
          email: e.target.email.value,
          _csrf: props?.data,
          type:e.target.type.value
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
        <input name="firstname"></input>
        <br />
        <input name="lastname"></input>
        <br />
        <input name="username"></input>
        <br />
        <input type="hidden" name="_csrf" value={props.csrf} />
        <label htmlFor="html">Company</label>
        <input type="radio" name="type" value={"company"} />
        <label htmlFor="html">User</label>
        <input type="radio" name="type" value={"user"}/>
        <br />
        <input type="submit"></input>
      </form>
    </div>
  );
}

export default Register;

export const getServerSideProps = async ({ req, res }) => {
  const result = await axios.get(
    `${req.headers["x-forwarded-proto"]}://${req.headers.host}/api/auth/register`,
    {
      withCredentials: true,
      headers: {
        Cookie: req.headers.cookie,
      },
    }
  );
  // console.log(result.data, req?.headers?.cookie?.split(";")[1].split("=")[1] || {});
  // console.log(res);
  return {
    props: {
      data: result?.data,

      csrf: getCookie('_csrf', { req, res }) || {},
    },
  };
};
