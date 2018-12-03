function foo() {
  const container = document.querySelectorAll('.container');
  container[0].textContent = 'Loading...';
import(/* webpackChunkName: "intermock" */ '../../src/index').then((module: any) => {console.warn(module);

                                                                                       container[0].textContent = 'Done!';}

  );
}

foo();
