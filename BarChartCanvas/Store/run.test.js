import run from './run';

global.d3 = require("d3")

describe("all", () => {
  test("getProgressValue", function () {
    const data = [
      {
        _time: new Date(2001, 1, 1),
        _value: 10
      },
      {
        _time: new Date(2003, 1, 1),
        _value: 20
      }
    ]
    {
      const time = new Date(2002,1,1)
      const value = run.getProgressValue(data, time)
      expect(value).toBe(15)
    }
    {
      const time = new Date(2004,1,1)
      const value = run.getProgressValue(data, time)
      expect(value).toBe(null)
    }
    {
      const time = new Date(2000,1,1)
      const value = run.getProgressValue(data, time)
      expect(value).toBe(null)
    }
  })
})

