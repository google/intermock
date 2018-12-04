async function foo() {
  const container = document.querySelectorAll('.container');
  container[0].textContent = 'Loading...';
  const module = await import(/* webpackChunkName: "intermock" */ 'intermock');

  console.warn(module);

  container[0].textContent = 'Done!';
}

foo();
