async function foo() {
  const container = document.querySelectorAll('.container');
  container[0].textContent = 'Loading...';
  const module =
      await import(/* webpackChunkName: "intermock" */ '../../src/index');


  console.warn(module);
  container[0].textContent = 'Done!';
}
console.warn('running foo');
foo();
console.warn('after foo');
