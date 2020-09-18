# Simple Beanstalkd CLI

[![npm version](https://badge.fury.io/js/beanstalkd-cli.svg)](https://badge.fury.io/js/beanstalkd-cli)

## Install

`npm i -g beanstalkd-cli`

## Usage

`bean [options] [command]`

### Commands
  
### drain \<tube\> [tubes...]

Drain all messages from specified tubes.  

Example: `bean drain default foo bar`  
This will delete all "ready" messages from tubes default, foo and bar for messages

### list-tubes

List all tubes  

### pause

Pause specified tubes. Not implemented yet.

### mput

Put contents of stdin into beanstalkd; use --delimeter (default: [\0\n])

Example: `find . -type f | bean mput`

Add one message for each filename into default tube
