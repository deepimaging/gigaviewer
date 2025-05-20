// If you're running on a local machine and want
// retrieve data from server.
// const url = "https://gigazoom.rc.duke.edu";

// No external url needed when running on the server.
const url = "";

// Variable used to remember original url.
const url_orig = get_orig()

export {url, url_orig};

function get_orig()
{
  let orig = window.location.pathname;
  orig = orig.split("/team")[0];
  orig = orig.split("/viewer")[0];
  orig = orig.split("/tag")[0];
  console.log(orig);
  return orig == "/" ? "" : orig;
}