export default function () {

  function test () {}

  test.run = function () {
    console.log('Run test!')
    return test
  }

  return test
}