import * as commander from 'commander'
import {translate} from './main'


const program = new commander.Command()

program
  .version('0.0.1')
  .name('fanyi')
  .usage('<English>')
  .arguments('<English>')
  .action((word) => {
    translate(word)
  })

program.parse(process.argv)